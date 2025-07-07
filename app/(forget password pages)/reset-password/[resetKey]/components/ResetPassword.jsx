export const resetPasswordEmail = (resetPasswordURL, language = 'en') => {
  const emailTranslations = {
    en: {
      reset_title: "Password Reset",
      reset_subtitle: "Secure your account",
      reset_message: "You've requested to reset your password for your TapIt account. Click the button below to create a new password. This link will expire in 24 hours for security reasons.",
      security_notice: "Security Notice",
      reset_security_message: "If you didn't request this password reset, please ignore this email. Your account remains secure and no changes have been made.",
      reset_button: "Reset My Password →",
      reset_footer_message: "This email was sent from TapIt",
      reset_footer_note: "If you're having trouble with the button above, copy and paste this URL into your browser:",
      security_expire_note: "For your security, this link will expire in 24 hours. If you need assistance, please contact our support team."
    },
    fr: {
      reset_title: "Réinitialisation du mot de passe",
      reset_subtitle: "Sécurisez votre compte",
      reset_message: "Vous avez demandé à réinitialiser votre mot de passe pour votre compte TapIt. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe. Ce lien expirera dans 24 heures pour des raisons de sécurité.",
      security_notice: "Avis de sécurité",
      reset_security_message: "Si vous n'avez pas demandé cette réinitialisation de mot de passe, veuillez ignorer cet e-mail. Votre compte reste sécurisé et aucune modification n'a été apportée.",
      reset_button: "Réinitialiser mon mot de passe →",
      reset_footer_message: "Cet e-mail a été envoyé depuis TapIt",
      reset_footer_note: "Si vous rencontrez des problèmes avec le bouton ci-dessus, copiez et collez cette URL dans votre navigateur :",
      security_expire_note: "Pour votre sécurité, ce lien expirera dans 24 heures. Si vous avez besoin d'aide, veuillez contacter notre équipe de support."
    },
    es: {
      reset_title: "Restablecimiento de contraseña",
      reset_subtitle: "Asegura tu cuenta",
      reset_message: "Has solicitado restablecer tu contraseña para tu cuenta de TapIt. Haz clic en el botón de abajo para crear una nueva contraseña. Este enlace expirará en 24 horas por razones de seguridad.",
      security_notice: "Aviso de seguridad",
      reset_security_message: "Si no solicitaste este restablecimiento de contraseña, por favor ignora este correo. Tu cuenta permanece segura y no se han realizado cambios.",
      reset_button: "Restablecer mi contraseña →",
      reset_footer_message: "Este correo fue enviado desde TapIt",
      reset_footer_note: "Si tienes problemas con el botón de arriba, copia y pega esta URL en tu navegador:",
      security_expire_note: "Por tu seguridad, este enlace expirará en 24 horas. Si necesitas ayuda, por favor contacta a nuestro equipo de soporte."
    },
    vm: {
      reset_title: "Đặt lại mật khẩu",
      reset_subtitle: "Bảo mật tài khoản của bạn",
      reset_message: "Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản TapIt của mình. Nhấp vào nút bên dưới để tạo mật khẩu mới. Liên kết này sẽ hết hạn sau 24 giờ vì lý do bảo mật.",
      security_notice: "Thông báo bảo mật",
      reset_security_message: "Nếu bạn không yêu cầu đặt lại mật khẩu này, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn và không có thay đổi nào được thực hiện.",
      reset_button: "Đặt lại mật khẩu của tôi →",
      reset_footer_message: "Email này được gửi từ TapIt",
      reset_footer_note: "Nếu bạn gặp sự cố với nút ở trên, hãy sao chép và dán URL này vào trình duyệt của bạn:",
      security_expire_note: "Vì lý do bảo mật, liên kết này sẽ hết hạn sau 24 giờ. Nếu bạn cần hỗ trợ, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi."
    },
    zh: {
      reset_title: "密码重置",
      reset_subtitle: "保护您的账户",
      reset_message: "您已请求重置您的 TapIt 账户密码。点击下面的按钮创建新密码。出于安全考虑，此链接将在 24 小时后过期。",
      security_notice: "安全提醒",
      reset_security_message: "如果您没有请求此密码重置，请忽略此邮件。您的账户仍然安全，没有进行任何更改。",
      reset_button: "重置我的密码 →",
      reset_footer_message: "此邮件来自 TapIt",
      reset_footer_note: "如果您无法使用上面的按钮，请将此 URL 复制并粘贴到您的浏览器中：",
      security_expire_note: "出于安全考虑，此链接将在 24 小时后过期。如果您需要帮助，请联系我们的支持团队。"
    }
  };

  const t = emailTranslations[language] || emailTranslations.en;
  
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
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden;">
          
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
          
          <tr>
            <td style="padding: 48px 32px;">
              <p style="font-size: 16px; color: #6B7280; margin: 0 0 32px 0; line-height: 1.7; font-family: Arial, sans-serif;">${t.reset_message}</p>
              
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 32px 0;">
                <tr>
                  <td>
                    <h3 style="color: #dc2626; font-size: 16px; font-weight: bold; margin: 0 0 8px 0; font-family: Arial, sans-serif;">🔒 ${t.security_notice}</h3>
                    <p style="color: #b91c1c; font-size: 14px; margin: 0; font-family: Arial, sans-serif;">${t.reset_security_message}</p>
                  </td>
                </tr>
              </table>
              
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 40px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetPasswordURL}" style="display: inline-block; background-color: #DC2626; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 16px; font-family: Arial, sans-serif;">${t.reset_button}</a>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 16px; color: #6B7280; margin: 0; line-height: 1.7; font-family: Arial, sans-serif;">${t.security_expire_note}</p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #6B7280; font-size: 14px; margin: 0 0 16px 0; font-family: Arial, sans-serif;">${t.reset_footer_message}</p>
              <p style="font-size: 12px; color: #9CA3AF; margin: 0; font-family: Arial, sans-serif; word-break: break-all;">
                ${t.reset_footer_note}<br>
                <span style="color: #674299;">${resetPasswordURL}</span>
              </p>
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