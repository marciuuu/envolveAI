import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://mimjdcxugcrwktznchsr.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// UUID do usuário
let usuario_id = localStorage.getItem('usuario_id')
if (!usuario_id) {
  usuario_id = crypto.randomUUID()
  localStorage.setItem('usuario_id', usuario_id)
}

let fraseAtual = null

// Carregar frase do dia
async function carregarFrase() {
  const hoje = new Date().toISOString().split('T')[0]

  // Verifica se já existe visto hoje
  let { data: visto } = await supabase
    .from('vistos')
    .select('*')
    .eq('usuario_id', usuario_id)
    .eq('data_visualizacao', hoje)
    .single()

  if (visto) {
    const { data } = await supabase
      .from('frases')
      .select('*')
      .eq('id', visto.frase_id)
      .single()
    fraseAtual = data
  } else {
    const { data } = await supabase.from('frases').select('*')
    fraseAtual = data[Math.floor(Math.random() * data.length)]

    await supabase.from('vistos').insert({
      usuario_id,
      frase_id: fraseAtual.id,
      data_visualizacao: hoje
    })
  }

  document.getElementById('frase').innerText = fraseAtual.texto
  document.getElementById('autor').innerText = fraseAtual.autor || ''
}

// Favoritar frase
document.getElementById('favoritar').addEventListener('click', async () => {
  if (!fraseAtual) return
  const { error } = await supabase.from('favoritos').insert({
    usuario_id,
    frase_id: fraseAtual.id
  })
  if (error) {
    alert('Você já favoritou esta frase!')
  } else {
    alert('Frase adicionada aos favoritos! ⭐')
  }
})

// Compartilhar frase (copiar para área de transferência)
document.getElementById('compartilhar').addEventListener('click', () => {
  if (!fraseAtual) return
  const texto = `"${fraseAtual.texto}"\n- ${fraseAtual.autor || 'Desconhecido'}`
  navigator.clipboard.writeText(texto).then(() => {
    alert('Frase copiada para a área de transferência! 📋')
  })
})

// Executa ao carregar a página
carregarFrase()