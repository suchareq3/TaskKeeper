import { createFileRoute, redirect } from '@tanstack/react-router'
import { getAuth } from 'firebase/auth';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
      // Direct Firebase check
      if (getAuth().currentUser) {
        throw redirect({ to: "/protected" });
      } else {
        throw redirect({ to: "/login" });
      }
    },
})