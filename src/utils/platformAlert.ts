import { Alert, Platform } from "react-native"

interface AlertButton {
  text: string
  onPress?: () => void
  style?: "default" | "cancel" | "destructive"
}

export const showAlert = (title: string, message?: string, buttons?: AlertButton[]) => {
  if (Platform.OS === "web") {
    const fullMessage = message ? `${title}\n\n${message}` : title

    if (!buttons || buttons.length === 0) {
      window.alert(fullMessage)
      return
    }

    if (buttons.length === 1) {
      window.alert(fullMessage)
      buttons[0].onPress?.()
      return
    }

    // For confirmation dialogs (2 buttons)
    const confirmed = window.confirm(fullMessage)
    const buttonToCall =
      buttons.find((btn) => (confirmed ? btn.style !== "cancel" : btn.style === "cancel")) || buttons[confirmed ? 0 : 1]

    buttonToCall?.onPress?.()
  } else {
    Alert.alert(title, message, buttons)
  }
}
