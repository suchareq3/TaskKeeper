import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Text } from './ui/text';
import i18n from './translations';

interface ErrorContextType {
  showError: (message: string, title?: string, isTranslationKey?: boolean) => void;
  logError: (error: unknown, context?: string) => void;
}

const ErrorContext = createContext<ErrorContextType>({
  showError: () => {},
  logError: () => {},
});

export const useError = () => useContext(ErrorContext);

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorTitle, setErrorTitle] = useState('Error');
  const [errorMessage, setErrorMessage] = useState('');
  const [isTranslationKey, setIsTranslationKey] = useState(false);

  const showError = (message: string, title: string = 'Error', isTranslationKey: boolean = false) => {
    setErrorTitle(title);
    
    // If this is a translation key, we'll handle it in the dialog
    setErrorMessage(message);
    
    // Set a flag to indicate if this is a translation key
    setIsTranslationKey(isTranslationKey);
    
    setIsOpen(true);
    // Don't log to console here - this prevents the infinite loop
  };

  const logError = (error: unknown, context: string = '') => {
    let message = 'An unknown error occurred';
    let isTranslationKey = false;
    
    console.log("Error object:", error); // Debug log
    
    if (error instanceof Error) {
      message = error.message;
      // Check if this is a translation key error
      isTranslationKey = (error as any).isTranslationKey === true;
      console.log("Error is instance of Error, message:", message, "isTranslationKey:", isTranslationKey); // Debug log
    } else if (typeof error === 'string') {
      message = error;
      console.log("Error is string:", message); // Debug log
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = String((error as { message: unknown }).message);
      // Check if this is a translation key error
      isTranslationKey = (error as any).isTranslationKey === true;
      console.log("Error is object with message:", message, "isTranslationKey:", isTranslationKey); // Debug log
    }

    const title = context ? `Error in ${context}` : 'Error';
    
    console.log("Showing error dialog with message:", message, "title:", title, "isTranslationKey:", isTranslationKey); // Debug log
    
    // Show dialog to user
    showError(message, title, isTranslationKey);
  };

  return (
    <ErrorContext.Provider value={{ showError, logError }}>
      {children}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{errorTitle}</DialogTitle>
            <DialogDescription>
              {isTranslationKey ? (
                <TranslatedError translationKey={errorMessage} />
              ) : (
                errorMessage
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onPress={() => setIsOpen(false)}>
              <Text>Close</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ErrorContext.Provider>
  );
}

// Component to handle translated error messages
function TranslatedError({ translationKey }: { translationKey: string }) {
  // Debug log
  console.log("TranslatedError component called with key:", translationKey);
  console.log("Translation result:", i18n.t(translationKey));
  
  // Use i18n directly instead of useTranslation
  return <>{i18n.t(translationKey) || translationKey}</>;
}
