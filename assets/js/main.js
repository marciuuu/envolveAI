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

// Função para carregar a frase do dia
async function carregarFrase() {
  const hoje = new Date().toISOString().split('T')[0]

  let { data: visto } = await supabase
    .from('vistos')
    .select('*')
    .eq('usuario_id', usuario_id)
    .eq('data_visualizacao', hoje)
    .single()

  let frase
  if (visto) {
    const { data } = await supabase
      .from('frases')
      .select('*')
      .eq('id', visto.frase_id)
      .single()
    frase = data
  } else {
    const { data } = await supabase.from('frases').select('*')
    frase = data[Math.floor(Math.random() * data.length)]

    await supabase.from('vistos').insert({
      usuario_id,
      frase_id: frase.id,
      data_visualizacao: hoje
    })
  }

  document.getElementById('frase').innerText = frase.texto
  document.getElementById('autor').innerText = frase.autor || ''
}

carregarFrase()