// ============================================
// imgbb Image Upload Service
// ============================================
const IMGBB_API_KEY = '61eafcd9b2b4aa44cb94bda08c71babf';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

/**
 * Upload an image file to imgbb and return the URL
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export async function uploadImageToImgbb(imageFile) {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('key', IMGBB_API_KEY);

        const response = await fetch(IMGBB_UPLOAD_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`imgbb upload failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
            return data.data.display_url;
        } else {
            throw new Error('imgbb upload returned unsuccessful response');
        }
    } catch (error) {
        console.error('Image upload error:', error);
        throw error;
    }
}
