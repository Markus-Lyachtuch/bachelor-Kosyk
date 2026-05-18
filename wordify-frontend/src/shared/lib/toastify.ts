import { toast } from "react-toastify";

export const showPositiveToast = (message: string) => toast.success(message);
export const showNegativeToast = (message: string) => toast.error(message);
