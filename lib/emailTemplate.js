export const welcomeEmail = (email, password, name, language = 'en') => {
  // Email translations
  const emailTranslations = {
    en: {
      welcome_title: "Welcome to TapIt!",
      welcome_subtitle: "Your all-in-one link sharing platform",
      greeting: "Hi {name}! 👋",
      welcome_message: "Welcome to TapIt, the modern link-in-bio platform that helps you showcase all your content in one place! Your account has been created successfully and you're ready to start building your digital presence. Connect all your social profiles, websites, and content with a single, beautiful link.",
      credentials_title: "Your Login Credentials",
      email_label: "Email",
      password_label: "Password",
      cta_button: "Start Building Your Profile →",
      ready_message: "Ready to get started? Log in to your TapIt dashboard to customize your profile, add your links, and start sharing your personalized TapIt page with the world!",
      footer_thanks: "Thank you for joining TapIt! 🚀",
      about_link: "About TapIt",
      dashboard_link: "Dashboard",
      support_link: "Support",
      privacy_link: "Privacy Policy",
      copyright: "© 2024 TapIt. All rights reserved. Built by the TapIt Team"
    },
    fr: {
      welcome_title: "Bienvenue sur TapIt !",
      welcome_subtitle: "Votre plateforme de partage de liens tout-en-un",
      greeting: "Salut {name} ! 👋",
      welcome_message: "Bienvenue sur TapIt, la plateforme moderne de lien en bio qui vous aide à présenter tout votre contenu en un seul endroit ! Votre compte a été créé avec succès et vous êtes prêt à commencer à construire votre présence numérique. Connectez tous vos profils sociaux, sites web et contenu avec un seul lien magnifique.",
      credentials_title: "Vos Identifiants de Connexion",
      email_label: "E-mail",
      password_label: "Mot de passe",
      cta_button: "Commencer à Créer Votre Profil →",
      ready_message: "Prêt à commencer ? Connectez-vous à votre tableau de bord TapIt pour personnaliser votre profil, ajouter vos liens et commencer à partager votre page TapIt personnalisée avec le monde !",
      footer_thanks: "Merci de rejoindre TapIt ! 🚀",
      about_link: "À propos de TapIt",
      dashboard_link: "Tableau de bord",
      support_link: "Support",
      privacy_link: "Politique de Confidentialité",
      copyright: "© 2024 TapIt. Tous droits réservés. Conçu par l'équipe TapIt"
    },
    es: {
      welcome_title: "¡Bienvenido a TapIt!",
      welcome_subtitle: "Tu plataforma todo-en-uno para compartir enlaces",
      greeting: "¡Hola {name}! 👋",
      welcome_message: "¡Bienvenido a TapIt, la plataforma moderna de enlace en bio que te ayuda a mostrar todo tu contenido en un solo lugar! Tu cuenta ha sido creada exitosamente y estás listo para comenzar a construir tu presencia digital. Conecta todos tus perfiles sociales, sitios web y contenido con un solo enlace hermoso.",
      credentials_title: "Tus Credenciales de Inicio de Sesión",
      email_label: "Correo electrónico",
      password_label: "Contraseña",
      cta_button: "Comenzar a Crear Tu Perfil →",
      ready_message: "¿Listo para comenzar? Inicia sesión en tu panel de TapIt para personalizar tu perfil, agregar tus enlaces y comenzar a compartir tu página TapIt personalizada con el mundo.",
      footer_thanks: "¡Gracias por unirte a TapIt! 🚀",
      about_link: "Acerca de TapIt",
      dashboard_link: "Panel de Control",
      support_link: "Soporte",
      privacy_link: "Política de Privacidad",
      copyright: "© 2024 TapIt. Todos los derechos reservados. Creado por el equipo TapIt"
    },
    vm: {
      welcome_title: "Chào mừng đến với TapIt!",
      welcome_subtitle: "Nền tảng chia sẻ liên kết tất-cả-trong-một của bạn",
      greeting: "Xin chào {name}! 👋",
      welcome_message: "Chào mừng bạn đến với TapIt, nền tảng liên kết trong bio hiện đại giúp bạn trưng bày tất cả nội dung của mình ở một nơi! Tài khoản của bạn đã được tạo thành công và bạn đã sẵn sàng bắt đầu xây dựng sự hiện diện kỹ thuật số của mình. Kết nối tất cả hồ sơ xã hội, trang web và nội dung của bạn với một liên kết đẹp duy nhất.",
      credentials_title: "Thông Tin Đăng Nhập Của Bạn",
      email_label: "Email",
      password_label: "Mật khẩu",
      cta_button: "Bắt Đầu Xây Dựng Hồ Sơ →",
      ready_message: "Sẵn sàng bắt đầu? Đăng nhập vào bảng điều khiển TapIt của bạn để tùy chỉnh hồ sơ, thêm liên kết và bắt đầu chia sẻ trang TapIt cá nhân hóa của bạn với thế giới!",
      footer_thanks: "Cảm ơn bạn đã tham gia TapIt! 🚀",
      about_link: "Về TapIt",
      dashboard_link: "Bảng Điều Khiển",
      support_link: "Hỗ Trợ",
      privacy_link: "Chính Sách Bảo Mật",
      copyright: "© 2024 TapIt. Tất cả quyền được bảo lưu. Được xây dựng bởi đội ngũ TapIt"
    },
    zh: {
      welcome_title: "欢迎来到 TapIt！",
      welcome_subtitle: "您的一体化链接分享平台",
      greeting: "你好 {name}！👋",
      welcome_message: "欢迎来到 TapIt，这是一个现代化的个人简介链接平台，帮助您在一个地方展示所有内容！您的账户已成功创建，您已准备好开始建立您的数字存在。通过一个美观的链接连接您的所有社交资料、网站和内容。",
      credentials_title: "您的登录凭据",
      email_label: "邮箱",
      password_label: "密码",
      cta_button: "开始创建您的个人资料 →",
      ready_message: "准备开始了吗？登录您的 TapIt 仪表板来自定义您的个人资料，添加您的链接，并开始与世界分享您的个性化 TapIt 页面！",
      footer_thanks: "感谢您加入 TapIt！🚀",
      about_link: "关于 TapIt",
      dashboard_link: "仪表板",
      support_link: "支持",
      privacy_link: "隐私政策",
      copyright: "© 2024 TapIt。保留所有权利。由 TapIt 团队构建"
    }
  };

  const t = emailTranslations[language] || emailTranslations.en;
  const greeting = t.greeting.replace('{name}', name);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.welcome_title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;">

  <!-- Main Container -->
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; padding: 20px 0;">
    <tr>
      <td align="center">
        
        <!-- Email Container -->
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
          
          <!-- Header Section -->
          <tr>
            <td style="background: linear-gradient(135deg, #674299 0%, #8B5CF6 100%); background-color: #674299; padding: 48px 32px; text-align: center;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!-- Logo Container -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 32px; background-color: rgba(255, 255, 255, 0.2); border-radius: 32px; padding: 24px;">
                      <tr>
                        <td align="center">
                          <img src="https://firebasestorage.googleapis.com/v0/b/lintre-ffa96.firebasestorage.app/o/Logo%2Fimage-removebg-preview.png?alt=media&token=4ac6b2d0-463e-4ed7-952a-2fed14985fc0" 
                               alt="TapIt Logo" 
                               width="160" 
                               height="100" 
                               style="display: block; border: 0; filter: brightness(0) invert(1);">
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Header Text -->
                    <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 8px 0; font-family: Arial, sans-serif;">
                      ${t.welcome_title}
                    </h1>
                    <p style="color: rgba(255, 255, 255, 0.9); font-size: 18px; margin: 0; font-family: Arial, sans-serif;">
                      ${t.welcome_subtitle}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content Section -->
          <tr>
            <td style="padding: 48px 32px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <!-- Greeting -->
                    <h2 style="font-size: 20px; font-weight: bold; color: #111827; margin: 0 0 24px 0; font-family: Arial, sans-serif;">
                      ${greeting}
                    </h2>
                    
                    <!-- Welcome Message -->
                    <p style="font-size: 16px; color: #6B7280; margin: 0 0 32px 0; line-height: 1.7; font-family: Arial, sans-serif;">
                      ${t.welcome_message}
                    </p>
                    
                    <!-- Credentials Card -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; margin: 32px 0;">
                      <!-- Purple Top Border -->
                      <tr>
                        <td style="background-color: #674299; height: 4px; border-radius: 16px 16px 0 0;"></td>
                      </tr>
                      
                      <!-- Credentials Content -->
                      <tr>
                        <td style="padding: 32px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td>
                                <!-- Credentials Title -->
                                <h3 style="font-size: 18px; font-weight: bold; color: #374151; margin: 0 0 20px 0; font-family: Arial, sans-serif;">
                                  🔐 ${t.credentials_title}
                                </h3>
                                
                                <!-- Email Row -->
                                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
                                  <tr>
                                    <td style="padding-bottom: 8px;">
                                      <div style="font-weight: bold; color: #674299; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-family: Arial, sans-serif;">
                                        ${t.email_label}
                                      </div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                      <div style="background-color: #ffffff; padding: 12px; border-radius: 8px; color: #111827; font-weight: bold; border: 1px solid #d1d5db; font-family: monospace, Courier, sans-serif; word-break: break-all;">
                                        ${email}
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                                
                                <!-- Password Row -->
                                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                  <tr>
                                    <td style="padding-bottom: 8px;">
                                      <div style="font-weight: bold; color: #674299; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-family: Arial, sans-serif;">
                                        ${t.password_label}
                                      </div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                      <div style="background-color: #ffffff; padding: 12px; border-radius: 8px; color: #111827; font-weight: bold; border: 1px solid #d1d5db; font-family: monospace, Courier, sans-serif; word-break: break-all;">
                                        ${password}
                                      </div>
                                    </td>
                                  </tr>
                                </table>
                                
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 40px 0;">
                      <tr>
                        <td align="center">
                          <a href="https://www.tapit.fr/login" 
                             style="display: inline-block; background-color: #674299; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 16px; font-family: Arial, sans-serif;">
                            ${t.cta_button}
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Ready Message -->
                    <p style="font-size: 16px; color: #6B7280; margin: 0; line-height: 1.7; font-family: Arial, sans-serif;">
                      ${t.ready_message}
                    </p>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer Section -->
          <tr>
            <td style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!-- Footer Thanks -->
                    <p style="color: #6B7280; font-size: 14px; margin: 0 0 16px 0; font-family: Arial, sans-serif;">
                      ${t.footer_thanks}
                    </p>
                    
                    <!-- Footer Links -->
                    <p style="margin: 0 0 24px 0; font-family: Arial, sans-serif;">
                      <a href="https://www.tapit.fr/about" style="color: #674299; text-decoration: none; font-size: 14px; margin: 0 16px;">${t.about_link}</a>
                      <a href="https://www.tapit.fr/dashboard" style="color: #674299; text-decoration: none; font-size: 14px; margin: 0 16px;">${t.dashboard_link}</a>
                      <a href="https://www.tapit.fr/support" style="color: #674299; text-decoration: none; font-size: 14px; margin: 0 16px;">${t.support_link}</a>
                      <a href="https://www.tapit.fr/privacy" style="color: #674299; text-decoration: none; font-size: 14px; margin: 0 16px;">${t.privacy_link}</a>
                    </p>
                    
                    <!-- Social Links -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 20px;">
                      <tr>
                        <td>
                          <a href="https://twitter.com/tapit" 
                             style="display: inline-block; width: 44px; height: 44px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; margin: 0 6px; text-align: center; line-height: 44px; text-decoration: none; font-size: 18px;">
                            🐦
                          </a>
                        </td>
                        <td>
                          <a href="https://instagram.com/tapit" 
                             style="display: inline-block; width: 44px; height: 44px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; margin: 0 6px; text-align: center; line-height: 44px; text-decoration: none; font-size: 18px;">
                            📷
                          </a>
                        </td>
                        <td>
                          <a href="https://linkedin.com/company/tapit" 
                             style="display: inline-block; width: 44px; height: 44px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; margin: 0 6px; text-align: center; line-height: 44px; text-decoration: none; font-size: 18px;">
                            💼
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Copyright -->
                    <p style="margin: 0; font-size: 12px; color: #9CA3AF; font-family: Arial, sans-serif;">
                      ${t.copyright}
                    </p>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>
`;
};
// Add this new function to lib/emailTemplate.js

export const teamInvitationEmail = (teamName, invitedByName, personalMessage, invitationUrl, language = 'en') => {
  const t = {
    en: {
      title: `You're Invited to Join ${teamName} on TapIt!`,
      greeting: "Hello there! 👋",
      invite_message: `{inviter} has invited you to join the team "{team}" on TapIt.`,
      personal_note_title: "A personal note from {inviter}:",
      cta_button: "Accept Invitation & Join Team →",
      footer_message: "If you were not expecting this invitation, you can safely ignore this email.",
      copyright: "© 2024 TapIt. All rights reserved."
    },
    fr: {
      title: `Vous êtes invité(e) à rejoindre ${teamName} sur TapIt !`,
      greeting: "Bonjour ! 👋",
      invite_message: `{inviter} vous a invité(e) à rejoindre l'équipe "{team}" sur TapIt.`,
      personal_note_title: "Un message personnel de {inviter} :",
      cta_button: "Accepter l'invitation et rejoindre l'équipe →",
      footer_message: "Si vous ne vous attendiez pas à cette invitation, vous pouvez ignorer cet e-mail en toute sécurité.",
      copyright: "© 2024 TapIt. Tous droits réservés."
    }
    // Add other languages as needed
  }[language] || {
    en: {
      title: `You're Invited to Join ${teamName} on TapIt!`,
      greeting: "Hello there! 👋",
      invite_message: `{inviter} has invited you to join the team "{team}" on TapIt.`,
      personal_note_title: "A personal note from {inviter}:",
      cta_button: "Accept Invitation & Join Team →",
      footer_message: "If you were not expecting this invitation, you can safely ignore this email.",
      copyright: "© 2024 TapIt. All rights reserved."
    }
  }.en;

  const inviteMessage = t.invite_message.replace('{inviter}', invitedByName).replace('{team}', teamName);
  const personalNoteTitle = t.personal_note_title.replace('{inviter}', invitedByName);
  
  const personalMessageBlock = personalMessage 
    ? `<!-- Personal Message Card -->
       <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; margin: 32px 0;">
         <tr><td style="background-color: #674299; height: 4px; border-radius: 16px 16px 0 0;"></td></tr>
         <tr>
           <td style="padding: 24px;">
             <h3 style="color: #374151; font-size: 16px; font-weight: bold; margin: 0 0 12px 0; font-family: Arial, sans-serif;">${personalNoteTitle}</h3>
             <p style="color: #6B7280; font-size: 16px; margin: 0; font-style: italic; line-height: 1.7;">“${personalMessage}”</p>
           </td>
         </tr>
       </table>`
    : '';

  return `
    <!DOCTYPE html><html><head><meta charset="UTF-8"><title>${t.title}</title></head>
    <body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,sans-serif;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8fafc;padding:20px 0;">
        <tr><td align="center">
          <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background-color:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.1);">
            <tr><td style="background:linear-gradient(135deg, #674299 0%, #8B5CF6 100%);padding:48px 32px;text-align:center;">
              <h1 style="color:#fff;font-size:32px;font-weight:bold;margin:0;">${t.title}</h1>
            </td></tr>
            <tr><td style="padding:48px 32px;">
              <h2 style="font-size:20px;font-weight:bold;color:#111827;margin:0 0 24px;">${t.greeting}</h2>
              <p style="font-size:16px;color:#6B7280;margin:0 0 32px;line-height:1.7;">${inviteMessage}</p>
              ${personalMessageBlock}
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:40px 0;"><tr><td align="center">
                <a href="${invitationUrl}" style="display:inline-block;background-color:#674299;color:#fff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:bold;font-size:16px;">
                  ${t.cta_button}
                </a>
              </td></tr></table>
              <p style="font-size:14px;color:#9CA3AF;text-align:center;">${t.footer_message}</p>
            </td></tr>
            <tr><td style="background-color:#f8fafc;padding:32px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;">${t.copyright}</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body></html>`;
};

export const teamInvitationNotificationEmail = (teamName, invitedByName, personalMessage, language = 'en') => {
  const t = {
    en: {
      title: `You're Invited to Join ${teamName} on TapIt!`,
      greeting: "Hello there! 👋",
      invite_message: `{inviter} has invited you to join the team "{team}" on TapIt.`,
      personal_note_title: "A personal note from {inviter}:",
      cta_button: "View Invitation in Your Account →",
      footer_message: "Log in to your account page to accept or decline the invitation. If you were not expecting this, you can safely ignore this email.",
    },
    fr: {
      title: `Vous êtes invité(e) à rejoindre ${teamName} sur TapIt !`,
      greeting: "Bonjour ! 👋",
      invite_message: `{inviter} vous a invité(e) à rejoindre l'équipe "{team}" sur TapIt.`,
      personal_note_title: "Un message personnel de {inviter} :",
      cta_button: "Voir l'invitation dans votre compte →",
      footer_message: "Connectez-vous à la page de votre compte pour accepter ou refuser l'invitation. Si vous ne vous attendiez pas à cela, vous pouvez ignorer cet e-mail.",
    }
  }[language] || {
    en: {
      title: `You're Invited to Join ${teamName} on TapIt!`,
      greeting: "Hello there! 👋",
      invite_message: `{inviter} has invited you to join the team "{team}" on TapIt.`,
      personal_note_title: "A personal note from {inviter}:",
      cta_button: "View Invitation in Your Account →",
      footer_message: "Log in to your account page to accept or decline the invitation. If you were not expecting this, you can safely ignore this email.",
    }
  }.en;

  const inviteMessage = t.invite_message.replace('{inviter}', invitedByName).replace('{team}', teamName);
  const personalNoteTitle = t.personal_note_title.replace('{inviter}', invitedByName);
  const accountPageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://tapit.fr'}/dashboard/account`;

  const personalMessageBlock = personalMessage ? `...` : ''; // Your existing logic for this

  // Your full HTML email structure goes here, using the variables above
  // and linking the button to accountPageUrl
  return `
    <!DOCTYPE html><html><head><meta charset="UTF-8"><title>${t.title}</title></head>
    <body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,sans-serif;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8fafc;padding:20px 0;">
        <tr><td align="center">
          <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background-color:#fff;border-radius:24px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.1);">
            <tr><td style="background:linear-gradient(135deg, #674299 0%, #8B5CF6 100%);padding:48px 32px;text-align:center;">
              <h1 style="color:#fff;font-size:32px;font-weight:bold;margin:0;">${t.title}</h1>
            </td></tr>
            <tr><td style="padding:48px 32px;">
              <h2 style="font-size:20px;font-weight:bold;color:#111827;margin:0 0 24px;">${t.greeting}</h2>
              <p style="font-size:16px;color:#6B7280;margin:0 0 32px;line-height:1.7;">${inviteMessage}</p>
              ${personalMessageBlock}
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:40px 0;"><tr><td align="center">
                <a href="${accountPageUrl}" style="display:inline-block;background-color:#674299;color:#fff;text-decoration:none;padding:16px 32px;border-radius:12px;font-weight:bold;font-size:16px;">
                  ${t.cta_button}
                </a>
              </td></tr></table>
              <p style="font-size:14px;color:#9CA3AF;text-align:center;">${t.footer_message}</p>
            </td></tr>
            <tr><td style="background-color:#f8fafc;padding:32px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;">© 2024 TapIt. All rights reserved.</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body></html>
  `;
};
export const resetPasswordEmail = (resetPasswordURL, language = 'en') => {
  // Comprehensive multilingual translations for password reset email
  const resetEmailTranslations = {
    en: {
      reset_title: "Password Reset",
      reset_subtitle: "Secure your account",
      reset_message: "You've requested to reset your password for your TapIt account. Click the button below to create a new password. This link will expire in 1 hour for security reasons.",
      security_notice: "Security Notice",
      reset_security_message: "If you didn't request this password reset, please ignore this email. Your account remains secure and no changes have been made.",
      reset_button: "Reset My Password →",
      reset_footer_message: "This email was sent from TapIt",
      reset_footer_note: "If you're having trouble with the button above, copy and paste this URL into your browser:",
      expiry_notice: "For your security, this link will expire in 1 hour. If you need assistance, please contact our support team.",
      about_link: "About TapIt",
      dashboard_link: "Dashboard", 
      support_link: "Support",
      privacy_link: "Privacy Policy",
      copyright: "© 2024 TapIt. All rights reserved. Built by the TapIt Team"
    },
    fr: {
      reset_title: "Réinitialisation du Mot de Passe",
      reset_subtitle: "Sécurisez votre compte",
      reset_message: "Vous avez demandé à réinitialiser votre mot de passe pour votre compte TapIt. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe. Ce lien expirera dans 1 heure pour des raisons de sécurité.",
      security_notice: "Avis de Sécurité",
      reset_security_message: "Si vous n'avez pas demandé cette réinitialisation de mot de passe, veuillez ignorer cet e-mail. Votre compte reste sécurisé et aucun changement n'a été effectué.",
      reset_button: "Réinitialiser Mon Mot de Passe →",
      reset_footer_message: "Cet e-mail a été envoyé depuis TapIt",
      reset_footer_note: "Si vous avez des problèmes avec le bouton ci-dessus, copiez et collez cette URL dans votre navigateur :",
      expiry_notice: "Pour votre sécurité, ce lien expirera dans 1 heure. Si vous avez besoin d'aide, veuillez contacter notre équipe de support.",
      about_link: "À propos de TapIt",
      dashboard_link: "Tableau de bord",
      support_link: "Support", 
      privacy_link: "Politique de Confidentialité",
      copyright: "© 2024 TapIt. Tous droits réservés. Conçu par l'équipe TapIt"
    },
    es: {
      reset_title: "Restablecimiento de Contraseña",
      reset_subtitle: "Asegura tu cuenta",
      reset_message: "Has solicitado restablecer tu contraseña para tu cuenta de TapIt. Haz clic en el botón de abajo para crear una nueva contraseña. Este enlace expirará en 1 hora por razones de seguridad.",
      security_notice: "Aviso de Seguridad",
      reset_security_message: "Si no solicitaste este restablecimiento de contraseña, por favor ignora este correo electrónico. Tu cuenta permanece segura y no se han realizado cambios.",
      reset_button: "Restablecer Mi Contraseña →",
      reset_footer_message: "Este correo fue enviado desde TapIt",
      reset_footer_note: "Si tienes problemas con el botón de arriba, copia y pega esta URL en tu navegador:",
      expiry_notice: "Por tu seguridad, este enlace expirará en 1 hora. Si necesitas ayuda, por favor contacta a nuestro equipo de soporte.",
      about_link: "Acerca de TapIt",
      dashboard_link: "Panel de Control",
      support_link: "Soporte",
      privacy_link: "Política de Privacidad",
      copyright: "© 2024 TapIt. Todos los derechos reservados. Creado por el equipo TapIt"
    },
    vm: {
      reset_title: "Đặt Lại Mật Khẩu",
      reset_subtitle: "Bảo vệ tài khoản của bạn",
      reset_message: "Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản TapIt của mình. Nhấp vào nút bên dưới để tạo mật khẩu mới. Liên kết này sẽ hết hạn trong 1 giờ vì lý do bảo mật.",
      security_notice: "Thông Báo Bảo Mật",
      reset_security_message: "Nếu bạn không yêu cầu đặt lại mật khẩu này, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn và không có thay đổi nào được thực hiện.",
      reset_button: "Đặt Lại Mật Khẩu Của Tôi →",
      reset_footer_message: "Email này được gửi từ TapIt",
      reset_footer_note: "Nếu bạn gặp sự cố với nút ở trên, hãy sao chép và dán URL này vào trình duyệt của bạn:",
      expiry_notice: "Vì lý do bảo mật, liên kết này sẽ hết hạn trong 1 giờ. Nếu bạn cần hỗ trợ, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.",
      about_link: "Về TapIt",
      dashboard_link: "Bảng Điều Khiển",
      support_link: "Hỗ Trợ",
      privacy_link: "Chính Sách Bảo Mật",
      copyright: "© 2024 TapIt. Tất cả quyền được bảo lưu. Được xây dựng bởi đội ngũ TapIt"
    },
    zh: {
      reset_title: "密码重置",
      reset_subtitle: "保护您的账户",
      reset_message: "您已请求重置您的 TapIt 账户密码。点击下面的按钮创建新密码。出于安全考虑，此链接将在 1 小时后过期。",
      security_notice: "安全提醒",
      reset_security_message: "如果您没有请求此密码重置，请忽略此邮件。您的账户仍然安全，没有进行任何更改。",
      reset_button: "重置我的密码 →",
      reset_footer_message: "此邮件来自 TapIt",
      reset_footer_note: "如果您无法使用上面的按钮，请复制并粘贴此 URL 到您的浏览器：",
      expiry_notice: "为了您的安全，此链接将在 1 小时后过期。如果您需要帮助，请联系我们的支持团队。",
      about_link: "关于 TapIt",
      dashboard_link: "仪表板",
      support_link: "支持",
      privacy_link: "隐私政策",
      copyright: "© 2024 TapIt。保留所有权利。由 TapIt 团队构建"
    }
  };

  const t = resetEmailTranslations[language] || resetEmailTranslations.en;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.reset_title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;">

  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; padding: 20px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
          
          <!-- Header Section -->
          <tr>
            <td style="background-color: #DC2626; padding: 48px 32px; text-align: center;">
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 32px; background-color: rgba(255, 255, 255, 0.2); border-radius: 32px; padding: 24px;">
                <tr>
                  <td align="center">
                    <img src="https://firebasestorage.googleapis.com/v0/b/lintre-ffa96.firebasestorage.app/o/Logo%2Fimage-removebg-preview.png?alt=media&token=4ac6b2d0-463e-4ed7-952a-2fed14985fc0" 
                         alt="TapIt Logo" 
                         width="160" 
                         height="100" 
                         style="display: block; border: 0; filter: brightness(0) invert(1);">
                  </td>
                </tr>
              </table>
              <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 8px 0; font-family: Arial, sans-serif;">${t.reset_title}</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 18px; margin: 0; font-family: Arial, sans-serif;">${t.reset_subtitle}</p>
            </td>
          </tr>
          
          <!-- Content Section -->
          <tr>
            <td style="padding: 48px 32px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <!-- Reset Message -->
                    <p style="font-size: 16px; color: #6B7280; margin: 0 0 32px 0; line-height: 1.7; font-family: Arial, sans-serif;">${t.reset_message}</p>
                    
                    <!-- Security Notice Card -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 16px; margin: 32px 0;">
                      <!-- Red Top Border -->
                      <tr>
                        <td style="background-color: #dc2626; height: 4px; border-radius: 16px 16px 0 0;"></td>
                      </tr>
                      
                      <!-- Security Content -->
                      <tr>
                        <td style="padding: 24px;">
                          <h3 style="color: #dc2626; font-size: 16px; font-weight: bold; margin: 0 0 8px 0; font-family: Arial, sans-serif;">🔒 ${t.security_notice}</h3>
                          <p style="color: #b91c1c; font-size: 14px; margin: 0; font-family: Arial, sans-serif;">${t.reset_security_message}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- CTA Button -->
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 40px 0;">
                      <tr>
                        <td align="center">
                          <a href="${resetPasswordURL}" 
                             style="display: inline-block; background-color: #DC2626; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 16px; font-family: Arial, sans-serif;">
                            ${t.reset_button}
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Expiry Notice -->
                    <p style="font-size: 16px; color: #6B7280; margin: 0; line-height: 1.7; font-family: Arial, sans-serif;">${t.expiry_notice}</p>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer Section -->
          <tr>
            <td style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!-- Footer Message -->
                    <p style="color: #6B7280; font-size: 14px; margin: 0 0 16px 0; font-family: Arial, sans-serif;">${t.reset_footer_message}</p>
                    
                    <!-- Footer Links -->
                    <p style="margin: 0 0 24px 0; font-family: Arial, sans-serif;">
                      <a href="https://www.tapit.fr/about" style="color: #DC2626; text-decoration: none; font-size: 14px; margin: 0 16px;">${t.about_link}</a>
                      <a href="https://www.tapit.fr/dashboard" style="color: #DC2626; text-decoration: none; font-size: 14px; margin: 0 16px;">${t.dashboard_link}</a>
                      <a href="https://www.tapit.fr/support" style="color: #DC2626; text-decoration: none; font-size: 14px; margin: 0 16px;">${t.support_link}</a>
                      <a href="https://www.tapit.fr/privacy" style="color: #DC2626; text-decoration: none; font-size: 14px; margin: 0 16px;">${t.privacy_link}</a>
                    </p>
                    
                    <!-- Social Links -->
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 20px;">
                      <tr>
                        <td>
                          <a href="https://twitter.com/tapit" 
                             style="display: inline-block; width: 44px; height: 44px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; margin: 0 6px; text-align: center; line-height: 44px; text-decoration: none; font-size: 18px;">
                            🐦
                          </a>
                        </td>
                        <td>
                          <a href="https://instagram.com/tapit" 
                             style="display: inline-block; width: 44px; height: 44px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; margin: 0 6px; text-align: center; line-height: 44px; text-decoration: none; font-size: 18px;">
                            📷
                          </a>
                        </td>
                        <td>
                          <a href="https://linkedin.com/company/tapit" 
                             style="display: inline-block; width: 44px; height: 44px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; margin: 0 6px; text-align: center; line-height: 44px; text-decoration: none; font-size: 18px;">
                            💼
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Alternative URL -->
                    <p style="font-size: 12px; color: #9CA3AF; margin: 0 0 16px 0; font-family: Arial, sans-serif; word-break: break-all;">
                      ${t.reset_footer_note}<br>
                      <span style="color: #DC2626;">${resetPasswordURL}</span>
                    </p>
                    
                    <!-- Copyright -->
                    <p style="margin: 0; font-size: 12px; color: #9CA3AF; font-family: Arial, sans-serif;">
                      ${t.copyright}
                    </p>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;


};