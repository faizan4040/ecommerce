import connectDB from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperfunction";
import UserModel from "@/models/User.model";
import { jwtVerify } from "jose";
import { isValidObjectId } from "mongoose";

export async function PORT(request){

    try {
         await connectDB()
         const {token} = await request.json();
      
         if(!token){
            return new Response(JSON.stringify({
                success: false,
                message: 'Invalid or missing token.'
            }), {status: 400})
         }

         const secret = new TextEncoder().encode(process.env.SECRET_KEY);
         const decoded = await jwtVerify(token, secret);
         const userId = decoded.payload.userId;

         if(!isValidObjectId(userId)){
            return response(false, 400, 'Invalid user id')
         }

        //  get user and update verified status
         const user = await UserModel.findById(userId)
         if(!user){
            return response(false, 404, 'User not found.');
         }

            user.isEmailVerified = true;
            await user.save();

            return response(true, 200, 'Email verified successfully.');

    } catch (error) {
        return catchError(error, 'Email verification failed.');
    }

}