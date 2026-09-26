import emailjs from '@emailjs/browser';

const EMAIL_RECIPIENT = 'rsaha2833@gmail.com';

export async function sendOrderEmail(order) {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS is not configured. Add the VITE_EMAILJS values to .env.');
    }

    const items = order.items
        .map(item => `${item.name} x ${item.quantity} - Rs ${Number(item.price).toLocaleString('en-IN')}`)
        .join('\n');

    await emailjs.send(
        serviceId,
        templateId,
        {
            to_email: EMAIL_RECIPIENT,
            order_id: order.orderId,
            customer_name: order.customerName,
            customer_email: order.userEmail,
            phone: order.phone,
            address: `${order.address}, ${order.pincode}`,
            items,
            total_amount: `Rs ${Number(order.totalAmount).toLocaleString('en-IN')}`,
            order_date: new Date(order.createdAt).toLocaleString('en-IN')
        },
        { publicKey }
    );
}
