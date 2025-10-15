import { Alert, AlertProps } from '@mui/material'

interface ErrorAlertProps extends Omit<AlertProps, 'severity'> {
  message: string
}

export const ErrorAlert = ({ message, ...props }: ErrorAlertProps) => {
  if (!message) return null

  return (
    <Alert severity="error" {...props}>
      {message}
    </Alert>
  )
}

export default ErrorAlert