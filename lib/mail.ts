
import { Resend } from 'resend';

/**
 * Gestione Sindacale - Mail Service (Resend Implementation)
 */

const APP_NAME = 'Gestione Sindacale';
const BRAND_COLOR = '#1e40af';
const SENDER = 'noreply@gestionesindacale.it';
const SUPPORT_EMAIL = 'supporto@gestionesindacale.it';

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    throw new Error("RESEND_API_KEY non configurata. Verifica la configurazione su Vercel.");
  }
  
  return new Resend(apiKey);
};

/**
 * Invia una email di reset password
 */
export const sendResetPasswordEmail = async (email: string, userName: string) => {
  try {
    const resend = getResendClient();
    
    const { data, error } = await resend.emails.send({
      from: `Supporto ${APP_NAME} <${SENDER}>`,
      to: [email],
      subject: `Recupero Credenziali - ${APP_NAME}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background-color: ${BRAND_COLOR}; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${APP_NAME}</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #111827; margin-top: 0;">Gentile ${userName},</h2>
            <p style="color: #4b5563; line-height: 1.6;">È stata inoltrata una richiesta di recupero credenziali per il tuo account su ${APP_NAME}.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="#" style="background-color: ${BRAND_COLOR}; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reimposta Password</a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">Se non hai richiesto tu questa operazione, contatta immediatamente l'amministratore della tua sede.</p>
          </div>
          <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} ${APP_NAME} - Piattaforma Gestionale Professionale</p>
          </div>
        </div>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Invia una notifica di scadenza pratica
 */
export const sendDeadlineEmail = async (email: string, userName: string, caseTitle: string, deadline: string, priority: string) => {
  try {
    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: `Alert Scadenze ${APP_NAME} <${SENDER}>`,
      to: [email],
      subject: `⚠️ SCADENZA URGENTE: ${caseTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background-color: ${BRAND_COLOR}; padding: 24px;">
            <h1 style="color: white; margin: 0; font-size: 20px; text-align: center;">Avviso Scadenza Pratica</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #111827; margin-top: 0;">Attenzione ${userName},</h2>
            <p style="color: #4b5563;">Il sistema ha rilevato una pratica in scadenza critica che richiede la tua attenzione.</p>
            <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #991b1b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Pratica</td>
                  <td style="color: #111827; font-weight: bold; text-align: right;">${caseTitle}</td>
                </tr>
                <tr><td style="padding: 6px 0;"></td></tr>
                <tr>
                  <td style="color: #991b1b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Termine</td>
                  <td style="color: #dc2626; font-weight: bold; text-align: right;">${deadline}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

/**
 * Invia una richiesta di supporto
 */
export const sendSupportEmail = async (name: string, email: string, subject: string, message: string) => {
  try {
    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: `Contact Form ${APP_NAME} <${SENDER}>`,
      to: [SUPPORT_EMAIL],
      replyTo: email,
      subject: `[SUPPORTO] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #1e40af; padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">Richiesta Supporto Gestione Sindacale</h2>
          </div>
          <div style="padding: 30px;">
            <p><strong>Da:</strong> ${name} (${email})</p>
            <p><strong>Oggetto:</strong> ${subject}</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
            Messaggio generato dal modulo contatti della piattaforma.
          </div>
        </div>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};
