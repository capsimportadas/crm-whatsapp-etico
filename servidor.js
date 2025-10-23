const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const app = express();
app.use(express.json());

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Webhook para recibir mensajes de WhatsApp
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const { telefono, mensaje } = req.body;
    
    // Guardar en la base de datos
    const { data: cliente, error } = await supabase
      .from('clients')
      .upsert({
        phone: telefono,
        last_interaction: new Date(),
        status: 'lead'
      })
      .select();

    if (error) throw error;

    // Respuesta automática
    const respuesta = `¡Hola! Gracias por contactarnos. ¿En qué producto estás interesado/a?`;
    
    // Aquí integrarías con WhatsApp API para enviar respuesta
    console.log(`Responder a ${telefono}: ${respuesta}`);

    res.status(200).json({ exito: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener estadísticas
app.get('/estadisticas', async (req, res) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*');
  
  res.json({ total_clientes: data?.length || 0 });
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
  console.log(`Servidor CRM ejecutándose en puerto ${PUERTO}`);
});
