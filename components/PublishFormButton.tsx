import React, { useTransition } from 'react'
import { Button } from './ui/button'
import { MdOutlinePublish } from 'react-icons/md'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./ui/alert-dialog";
import { useRouter } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';
import { toast } from './ui/use-toast';
import { PublishForm } from '@/actions/form';

function PublishFormButton({ id }: { id: number }) {
    const [loading, startTransition] = useTransition();
    const router = useRouter();
    async function publishForm() {
        try {
            const response = await PublishForm(id);
            toast({
                title: "Success",
                description: "Your form is now available to the public",
            });
            if (location !== undefined) {
                location.reload();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
            });
            throw error;
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="gap-2 text-background bg-foreground ">
                    <MdOutlinePublish className="h-4 w-4" />
                    Publish
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. After publishing you will not be able to edit this form. <br />
                        <br />
                        <span className="font-medium">
                            By publishing this form you will make it available to the public and you will be able to collect
                            submissions.
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={loading}
                        onClick={(e) => {
                            e.preventDefault();
                            startTransition(publishForm);
                        }}
                    >
                        Proceed {loading && <FaSpinner className="animate-spin" />}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default PublishFormButton