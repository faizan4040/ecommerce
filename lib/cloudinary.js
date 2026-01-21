import {v2 as cloudinary} from 'cloudinary'

cloudinary.config({
   cloud_name: SPORT_SHOES_PUBLIC_CLOUDINARY_NAME,   
   api_key:  SPORT_SHOES_PUBLIC_CLOUDINARY_API_KEY,
   api_secret: CLOUDINARY_SECRET_KEY,  
})


export default cloudinary

