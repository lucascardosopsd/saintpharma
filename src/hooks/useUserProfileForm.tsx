import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserProfileSchema } from "@/validators/userProfile";

interface UseUserProfileFormProps {
  defaultValues?: Partial<z.infer<typeof UserProfileSchema>>;
}

const useUserProfileForm = ({ defaultValues }: UseUserProfileFormProps) => {
  return useForm<z.infer<typeof UserProfileSchema>>({
    mode: "onChange",
    resolver: zodResolver(UserProfileSchema),
    defaultValues: defaultValues || {},
  });
};

export default useUserProfileForm;
