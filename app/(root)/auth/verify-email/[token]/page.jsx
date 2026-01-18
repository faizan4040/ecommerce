"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WEBSITE_HOME } from "@/routes/WebsiteRoute";

import { Verified } from "lucide-react";
import { FaFileDownload } from "react-icons/fa";

const EmailVerification = () => {
  const { token } = useParams(); // ✅ correct way
  const [isVerified, setIsVerified] = useState(null);

  useEffect(() => {
    if (!token) return;

    const verifyEmail = async () => {
      try {
        const { data } = await axios.post("/api/auth/verify-email", { token });
        setIsVerified(data.success);
      } catch (error) {
        setIsVerified(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-96">
        <CardContent className="text-center py-8 space-y-4">
          {isVerified === true && (
            <>
              <Verified size={100} className="mx-auto text-green-500" />
              <h1 className="text-2xl font-bold text-green-500">
                Email verification successful!
              </h1>
            </>
          )}

          {isVerified === false && (
            <>
              <FaFileDownload size={100} className="mx-auto text-red-500" />
              <h1 className="text-2xl font-bold text-red-500">
                Email verification failed!
              </h1>
            </>
          )}

          {isVerified !== null && (
            <Button asChild>
              <Link href={WEBSITE_HOME}>Continue Shopping</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
