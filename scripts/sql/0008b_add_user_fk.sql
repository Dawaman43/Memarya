-- Add new foreign keys to auth user table after converting userId to text
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
