import type { Lang } from './messages';

export type LegalDocId = 'privacidade' | 'termos' | 'cookies';
export const LEGAL_IDS: LegalDocId[] = ['privacidade', 'termos', 'cookies'];

export interface LegalDoc {
  title: string;
  sections: { heading: string; paragraphs: string[] }[];
}

export const LEGAL_UPDATED = '2026-11-12';

/** Texto-base. Não substitui revisão jurídica antes do lançamento público (ver docs/ROADMAP.md, Fase 4). */
export const legal: Record<Lang, Record<LegalDocId, LegalDoc>> = {
  pt: {
    privacidade: {
      title: 'Política de privacidade',
      sections: [
        {
          heading: 'Quem somos',
          paragraphs: [
            'O Market Factory News é um serviço de informação sobre notícias de ações e forex. O responsável pelo tratamento dos dados é o operador do Market Factory News. Para exercer direitos ou colocar questões, use o contacto indicado no fim desta página.',
          ],
        },
        {
          heading: 'Dados que tratamos',
          paragraphs: [
            'Sem registo: não recolhemos dados pessoais. A lista de ativos que acompanha (watchlist) e o idioma ficam apenas no seu dispositivo.',
            'Com conta: o seu email (para iniciar sessão por ligação mágica), o identificador da conta, o nível de acesso e a sua watchlist, para a sincronizar entre dispositivos.',
            'Com o seu consentimento: dados de utilização e de erros (páginas vistas, ações principais, falhas técnicas), usados para melhorar o serviço. Sem consentimento, não são recolhidos.',
          ],
        },
        {
          heading: 'Para que usamos e com que base legal',
          paragraphs: [
            'Gerir a conta e a watchlist: execução do serviço que pediu. Enviar a ligação de início de sessão: execução do serviço. Análise de utilização e erros: o seu consentimento, que pode retirar a qualquer momento.',
          ],
        },
        {
          heading: 'Com quem partilhamos',
          paragraphs: [
            'Subcontratantes técnicos: Supabase (base de dados e autenticação), Cloudflare (alojamento do site) e, se consentir, serviços de análise e de registo de erros. Não vendemos dados pessoais.',
          ],
        },
        {
          heading: 'Conservação e os seus direitos',
          paragraphs: [
            'Guardamos os dados da conta enquanto esta existir. Pode apagar a conta a qualquer momento na página Conta, o que remove o seu perfil e a sua watchlist.',
            'Tem direito de acesso, retificação, apagamento, limitação, portabilidade e oposição, e de reclamar junto da Comissão Nacional de Proteção de Dados (CNPD).',
          ],
        },
      ],
    },
    termos: {
      title: 'Termos de utilização',
      sections: [
        {
          heading: 'Não é aconselhamento financeiro',
          paragraphs: [
            'O conteúdo do Market Factory News é informativo. Não constitui aconselhamento financeiro, de investimento, fiscal ou jurídico, nem recomendação para comprar ou vender qualquer ativo. As ligações entre notícias e ativos são sugestões automáticas e podem estar erradas. Decida por si, com a informação oficial e, se necessário, um profissional habilitado. Investir envolve risco de perda.',
          ],
        },
        {
          heading: 'Fontes e conteúdos de terceiros',
          paragraphs: [
            'Mostramos títulos, fonte, data, ligação e, quando a fonte é oficial, um excerto curto. Os direitos sobre os conteúdos pertencem às respetivas fontes, que identificamos sempre. Não garantimos exatidão, atualidade ou disponibilidade.',
          ],
        },
        {
          heading: 'Conta e uso aceitável',
          paragraphs: [
            'Pode usar o serviço sem conta; o registo gratuito dá acesso a mais conteúdo. É responsável pela segurança do seu email. Não pode usar o serviço para extrair dados em massa, perturbar o seu funcionamento ou violar a lei.',
          ],
        },
        {
          heading: 'Responsabilidade e alterações',
          paragraphs: [
            'O serviço é fornecido tal como está, na máxima medida permitida pela lei. Podemos alterar o serviço e estes termos; a data da última atualização consta desta página. Aplica-se a lei portuguesa.',
          ],
        },
      ],
    },
    cookies: {
      title: 'Política de cookies e armazenamento local',
      sections: [
        {
          heading: 'O que usamos',
          paragraphs: [
            'Estritamente necessário (sem consentimento): armazenamento local do idioma, da watchlist, da sua escolha sobre análise e, com conta, da sessão.',
            'Análise de utilização e de erros: só depois de aceitar. Se recusar, nada é carregado.',
          ],
        },
        {
          heading: 'Como mudar a escolha',
          paragraphs: ['Pode alterar ou retirar o consentimento em qualquer momento com o botão abaixo. Limpar os dados do site no browser também repõe a escolha.'],
        },
      ],
    },
  },
  en: {
    privacidade: {
      title: 'Privacy policy',
      sections: [
        {
          heading: 'Who we are',
          paragraphs: [
            'Market Factory News is an information service about stock and forex news. The data controller is the operator of Market Factory News. To exercise your rights or ask questions, use the contact shown at the end of this page.',
          ],
        },
        {
          heading: 'Data we process',
          paragraphs: [
            'Without an account: we collect no personal data. Your watchlist and language stay on your device only.',
            'With an account: your email (to sign in by magic link), account identifier, access level and your watchlist, to sync it across devices.',
            'With your consent: usage and error data (pages viewed, main actions, technical failures) used to improve the service. Without consent, none is collected.',
          ],
        },
        {
          heading: 'Purposes and legal basis',
          paragraphs: [
            'Running your account and watchlist, and sending the sign-in link: performance of the service you requested. Usage and error analytics: your consent, which you can withdraw at any time.',
          ],
        },
        {
          heading: 'Who we share it with',
          paragraphs: [
            'Technical processors: Supabase (database and authentication), Cloudflare (site hosting) and, if you consent, analytics and error-logging services. We do not sell personal data.',
          ],
        },
        {
          heading: 'Retention and your rights',
          paragraphs: [
            'We keep account data while the account exists. You can delete your account at any time on the Account page, which removes your profile and watchlist.',
            'You have the rights of access, rectification, erasure, restriction, portability and objection, and the right to complain to the Portuguese data protection authority (CNPD) or your local authority.',
          ],
        },
      ],
    },
    termos: {
      title: 'Terms of use',
      sections: [
        {
          heading: 'Not financial advice',
          paragraphs: [
            'Market Factory News content is informational. It is not financial, investment, tax or legal advice, nor a recommendation to buy or sell any asset. Links between news and assets are automatic suggestions and may be wrong. Decide for yourself, using official information and, if needed, a qualified professional. Investing involves risk of loss.',
          ],
        },
        {
          heading: 'Sources and third-party content',
          paragraphs: [
            'We show headlines, source, date, link and, for official sources, a short excerpt. Rights in the content belong to the respective sources, which we always identify. We do not guarantee accuracy, timeliness or availability.',
          ],
        },
        {
          heading: 'Account and acceptable use',
          paragraphs: [
            'You can use the service without an account; free registration unlocks more content. You are responsible for the security of your email. You may not scrape the service in bulk, disrupt it or break the law.',
          ],
        },
        {
          heading: 'Liability and changes',
          paragraphs: [
            'The service is provided as is, to the fullest extent permitted by law. We may change the service and these terms; the date of the last update is on this page. Portuguese law applies.',
          ],
        },
      ],
    },
    cookies: {
      title: 'Cookies and local storage policy',
      sections: [
        {
          heading: 'What we use',
          paragraphs: [
            'Strictly necessary (no consent needed): local storage of your language, watchlist, your analytics choice and, with an account, your session.',
            'Usage and error analytics: only after you accept. If you decline, nothing is loaded.',
          ],
        },
        {
          heading: 'How to change your choice',
          paragraphs: ['You can change or withdraw consent at any time with the button below. Clearing the site data in your browser also resets it.'],
        },
      ],
    },
  },
  es: {
    privacidade: {
      title: 'Política de privacidad',
      sections: [
        {
          heading: 'Quiénes somos',
          paragraphs: [
            'Market Factory News es un servicio de información sobre noticias de acciones y forex. El responsable del tratamiento es el operador de Market Factory News. Para ejercer sus derechos o hacer preguntas, use el contacto indicado al final de esta página.',
          ],
        },
        {
          heading: 'Datos que tratamos',
          paragraphs: [
            'Sin registro: no recogemos datos personales. Su lista de seguimiento (watchlist) y el idioma quedan solo en su dispositivo.',
            'Con cuenta: su email (para iniciar sesión con enlace mágico), el identificador de la cuenta, el nivel de acceso y su watchlist, para sincronizarla entre dispositivos.',
            'Con su consentimiento: datos de uso y de errores (páginas vistas, acciones principales, fallos técnicos) para mejorar el servicio. Sin consentimiento, no se recogen.',
          ],
        },
        {
          heading: 'Finalidades y base jurídica',
          paragraphs: [
            'Gestionar la cuenta y la watchlist y enviar el enlace de acceso: ejecución del servicio solicitado. Análisis de uso y errores: su consentimiento, que puede retirar en cualquier momento.',
          ],
        },
        {
          heading: 'Con quién los compartimos',
          paragraphs: [
            'Encargados técnicos: Supabase (base de datos y autenticación), Cloudflare (alojamiento del sitio) y, si consiente, servicios de análisis y registro de errores. No vendemos datos personales.',
          ],
        },
        {
          heading: 'Conservación y sus derechos',
          paragraphs: [
            'Conservamos los datos de la cuenta mientras exista. Puede eliminar la cuenta en cualquier momento en la página Cuenta, lo que borra su perfil y su watchlist.',
            'Tiene derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición, y puede reclamar ante la autoridad de protección de datos portuguesa (CNPD) o la de su país.',
          ],
        },
      ],
    },
    termos: {
      title: 'Términos de uso',
      sections: [
        {
          heading: 'No es asesoramiento financiero',
          paragraphs: [
            'El contenido de Market Factory News es informativo. No constituye asesoramiento financiero, de inversión, fiscal ni jurídico, ni una recomendación de comprar o vender ningún activo. Los vínculos entre noticias y activos son sugerencias automáticas y pueden ser erróneos. Decida por sí mismo, con información oficial y, si es necesario, un profesional habilitado. Invertir conlleva riesgo de pérdida.',
          ],
        },
        {
          heading: 'Fuentes y contenidos de terceros',
          paragraphs: [
            'Mostramos titulares, fuente, fecha, enlace y, si la fuente es oficial, un extracto breve. Los derechos sobre los contenidos pertenecen a sus fuentes, que siempre identificamos. No garantizamos exactitud, actualidad ni disponibilidad.',
          ],
        },
        {
          heading: 'Cuenta y uso aceptable',
          paragraphs: [
            'Puede usar el servicio sin cuenta; el registro gratuito da acceso a más contenido. Es responsable de la seguridad de su email. No puede extraer datos en masa, perturbar el servicio ni infringir la ley.',
          ],
        },
        {
          heading: 'Responsabilidad y cambios',
          paragraphs: [
            'El servicio se ofrece tal cual, en la máxima medida permitida por la ley. Podemos modificar el servicio y estos términos; la fecha de la última actualización figura en esta página. Se aplica la ley portuguesa.',
          ],
        },
      ],
    },
    cookies: {
      title: 'Política de cookies y almacenamiento local',
      sections: [
        {
          heading: 'Qué usamos',
          paragraphs: [
            'Estrictamente necesario (sin consentimiento): almacenamiento local del idioma, la watchlist, su elección sobre análisis y, con cuenta, la sesión.',
            'Análisis de uso y errores: solo después de aceptar. Si rechaza, no se carga nada.',
          ],
        },
        {
          heading: 'Cómo cambiar su elección',
          paragraphs: ['Puede cambiar o retirar el consentimiento en cualquier momento con el botón de abajo. Borrar los datos del sitio en el navegador también lo restablece.'],
        },
      ],
    },
  },
};
