import nodemailer from 'nodemailer'
import QRCode from 'qrcode'

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

export interface TicketEmailData {
    recipientEmail: string
    recipientName: string
    bookingNumber: string
    eventTitle: string
    eventDate: string
    eventTime: string
    venueName: string
    venueAddress?: string
    tickets: {
        qrToken: string
        type: string
        seatInfo?: string
    }[]
    totalAmount: number
}

// Generate QR Code as base64 data URL
export async function generateQRCode(data: string): Promise<string> {
    try {
        return await QRCode.toDataURL(data, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        })
    } catch (error) {
        console.error('Error generating QR code:', error)
        throw error
    }
}

// Send booking confirmation email with ticket
export async function sendBookingConfirmationEmail(data: TicketEmailData): Promise<boolean> {
    try {
        // Generate QR codes for each ticket
        const ticketsWithQR = await Promise.all(
            data.tickets.map(async (ticket) => ({
                ...ticket,
                qrCodeDataUrl: await generateQRCode(ticket.qrToken)
            }))
        )

        const ticketHtml = ticketsWithQR.map((ticket, index) => `
            <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 15px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div style="background: white; padding: 20px; border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <img src="${ticket.qrCodeDataUrl}" alt="Ticket QR Code" style="width: 120px; height: 120px;"/>
                        <div>
                            <h3 style="margin: 0 0 10px 0; color: #1f2937;">Ticket #${index + 1}</h3>
                            <p style="margin: 5px 0; color: #6b7280;"><strong>Type:</strong> ${ticket.type}</p>
                            ${ticket.seatInfo ? `<p style="margin: 5px 0; color: #6b7280;"><strong>Seat:</strong> ${ticket.seatInfo}</p>` : ''}
                            <p style="margin: 5px 0; font-size: 12px; color: #9ca3af;">Code: ${ticket.qrToken}</p>
                        </div>
                    </div>
                </div>
            </div>
        `).join('')

        const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your tickets are ready</p>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <p style="font-size: 16px;">Hello <strong>${data.recipientName}</strong>,</p>
                    <p>Thank you for your booking! Here are your ticket details:</p>
                    
                    <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">📍 Event Details</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280;">Event:</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #1f2937;">${data.eventTitle}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280;">Date:</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #1f2937;">${data.eventDate}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280;">Time:</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #1f2937;">${data.eventTime}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280;">Venue:</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #1f2937;">${data.venueName}</td>
                            </tr>
                            ${data.venueAddress ? `
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280;">Address:</td>
                                <td style="padding: 8px 0; color: #1f2937;">${data.venueAddress}</td>
                            </tr>
                            ` : ''}
                            <tr>
                                <td style="padding: 8px 0; color: #6b7280;">Booking #:</td>
                                <td style="padding: 8px 0; font-weight: bold; color: #7c3aed;">${data.bookingNumber}</td>
                            </tr>
                        </table>
                    </div>

                    <h2 style="margin: 25px 0 15px 0; color: #1f2937; font-size: 20px;">🎫 Your Tickets</h2>
                    ${ticketHtml}

                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                        <p style="margin: 0; font-size: 14px; color: #92400e;">
                            <strong>💡 Tip:</strong> Save this email or take a screenshot of your QR codes. Present them at the entrance for check-in.
                        </p>
                    </div>

                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 14px;">Total Paid: <strong style="color: #059669; font-size: 18px;">€${data.totalAmount.toFixed(2)}</strong></p>
                        <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
                            Questions? Reply to this email or contact our support team.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `

        await transporter.sendMail({
            from: `"EventBook" <${process.env.SMTP_USER || 'noreply@eventbook.com'}>`,
            to: data.recipientEmail,
            subject: `🎫 Your Tickets for ${data.eventTitle} - Booking #${data.bookingNumber}`,
            html: emailHtml
        })

        console.log(`Email sent to ${data.recipientEmail}`)
        return true
    } catch (error) {
        console.error('Error sending email:', error)
        return false
    }
}

// Send event reminder email
export async function sendEventReminderEmail(
    email: string,
    name: string,
    eventTitle: string,
    eventDate: string,
    eventTime: string,
    venueName: string
): Promise<boolean> {
    try {
        const emailHtml = `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 16px; text-align: center; color: white;">
                    <h1 style="margin: 0;">⏰ Event Reminder</h1>
                </div>
                <div style="padding: 30px;">
                    <p>Hello ${name},</p>
                    <p>This is a friendly reminder that <strong>${eventTitle}</strong> is coming up!</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <p><strong>📅 Date:</strong> ${eventDate}</p>
                        <p><strong>⏰ Time:</strong> ${eventTime}</p>
                        <p><strong>📍 Venue:</strong> ${venueName}</p>
                    </div>
                    <p>Don't forget to bring your tickets (QR codes) for check-in!</p>
                    <p>See you there! 🎉</p>
                </div>
            </body>
            </html>
        `

        await transporter.sendMail({
            from: `"EventBook" <${process.env.SMTP_USER || 'noreply@eventbook.com'}>`,
            to: email,
            subject: `⏰ Reminder: ${eventTitle} is coming up!`,
            html: emailHtml
        })

        return true
    } catch (error) {
        console.error('Error sending reminder email:', error)
        return false
    }
}
