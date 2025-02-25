import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";
import { Button, TextField, Dialog } from "@radix-ui/themes";
import { fbFunctions } from "../../../../../shared/firebaseFunctions";

export const Route = createFileRoute("/protected/users/new")({
  component: CreateUserPage,
});

function CreateUserPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await fbFunctions.signUpUserNoToken(formData.email, formData.password, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: Timestamp.fromDate(new Date(formData.date_of_birth)),
      });

      // Redirect back to users list
      navigate({ to: "/protected/users" });
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create New User</h1>

      <h4 className="text-xl mb-4">NOTE: Creating a new user in this panel will result in that user not having the FCM token. This means that they will have broken notifications!</h4>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField.Root type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <TextField.Root type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <TextField.Root type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />
        <TextField.Root type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required />
        <TextField.Root type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />

        <Button type="submit">Create User</Button>
      </form>
    </div>
  );
}
