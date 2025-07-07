const apiKey = process.env.NEXT_PUBLIC_SMTP_API;

export const EmailJs = async (
    recipientName,
    recipientEmail,
    subject,
    htmlContent
) => {
    // Add detailed logging for debugging
    console.log('📧 EmailJs called with:', {
        recipientName,
        recipientEmail,
        subject,
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey?.length || 0
    });

    // Validate required parameters
    if (!recipientName || !recipientEmail || !subject || !htmlContent) {
        const error = new Error('Missing required email parameters');
        console.error('❌ Email validation failed:', {
            recipientName: !!recipientName,
            recipientEmail: !!recipientEmail,
            subject: !!subject,
            htmlContent: !!htmlContent
        });
        throw error;
    }

    // Validate API key
    if (!apiKey) {
        const error = new Error('SMTP API key is not configured');
        console.error('❌ SMTP API key missing. Check NEXT_PUBLIC_SMTP_API environment variable');
        throw error;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
        const error = new Error(`Invalid email format: ${recipientEmail}`);
        console.error('❌ Invalid email format:', recipientEmail);
        throw error;
    }

    try {
        const headers = new Headers({
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json',
        });

        const body = JSON.stringify({
            sender: {
                name: "TapIt Team",
                email: "noreply@tapit.fr",
            },
            to: [
                {
                    email: recipientEmail,
                    name: recipientName,
                },
            ],
            subject,
            htmlContent,
        });

        console.log('📤 Sending email to Brevo API...');
        console.log('🔗 API Endpoint: https://api.brevo.com/v3/smtp/email');
        console.log('📦 Request body size:', body.length, 'characters');

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers,
            body,
        });

        console.log('📨 Brevo API Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
        });

        // Always try to get response body for debugging
        let responseData;
        try {
            const responseText = await response.text();
            console.log('📄 Raw response:', responseText);
            
            if (responseText) {
                try {
                    responseData = JSON.parse(responseText);
                    console.log('📊 Parsed response data:', responseData);
                } catch (parseError) {
                    console.log('⚠️ Could not parse response as JSON:', parseError.message);
                    responseData = { rawText: responseText };
                }
            }
        } catch (textError) {
            console.error('❌ Could not read response text:', textError);
        }

        if (!response.ok) {
            const errorMessage = `Brevo API error: ${response.status} ${response.statusText}`;
            console.error('❌ Brevo API Error:', {
                status: response.status,
                statusText: response.statusText,
                responseData
            });
            
            // Create a more detailed error
            const error = new Error(errorMessage);
            error.status = response.status;
            error.responseData = responseData;
            throw error;
        }

        console.log('✅ Email sent successfully!');
        return {
            success: true,
            response,
            data: responseData
        };

    } catch (error) {
        console.error('❌ EmailJs Error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        // Re-throw with additional context
        const enhancedError = new Error(`Email sending failed: ${error.message}`);
        enhancedError.originalError = error;
        enhancedError.recipientEmail = recipientEmail;
        throw enhancedError;
    }
};