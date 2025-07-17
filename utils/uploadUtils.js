
export const prepareImageUpload = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return formData;
};