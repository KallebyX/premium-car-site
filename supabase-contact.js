// Integração com Supabase para o formulário de contato
import { createClient } from '@supabase/supabase-js';

// Inicializa o cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://sua-url-do-supabase.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sua-chave-anon-do-supabase';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Envia os dados do formulário de contato para o Supabase
 * @param {Object} formData - Dados do formulário
 * @returns {Promise} - Resultado da operação
 */
export async function submitContactForm(formData) {
  try {
    // Adiciona timestamp de criação
    const dataWithTimestamp = {
      ...formData,
      created_at: new Date().toISOString()
    };
    
    // Insere os dados na tabela 'contacts'
    const { data, error } = await supabase
      .from('contacts')
      .insert([dataWithTimestamp]);
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao enviar formulário:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Configura o formulário de contato com validação e envio
 * @param {string} formId - ID do elemento do formulário
 * @param {string} thankYouId - ID do elemento de mensagem de agradecimento
 * @param {string} formContainerId - ID do container do formulário
 */
export function setupContactForm(formId, thankYouId, formContainerId) {
  const form = document.getElementById(formId);
  const thankYouMessage = document.getElementById(thankYouId);
  const formContainer = document.getElementById(formContainerId);
  
  if (!form || !thankYouMessage || !formContainer) {
    console.error('Elementos do formulário não encontrados');
    return;
  }
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Mostra estado de carregamento
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...';
    
    // Coleta dados do formulário
    const formData = {
      name: form.querySelector('#name').value,
      email: form.querySelector('#email').value,
      phone: form.querySelector('#phone').value,
      subject: form.querySelector('#subject').value,
      message: form.querySelector('#message').value
    };
    
    try {
      const result = await submitContactForm(formData);
      
      if (result.success) {
        // Mostra mensagem de sucesso
        formContainer.style.display = 'none';
        thankYouMessage.style.display = 'block';
        form.reset();
      } else {
        // Mostra erro
        alert('Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao processar envio:', error);
      alert('Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.');
    } finally {
      // Restaura estado do botão
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    }
  });
}
