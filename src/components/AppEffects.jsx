import AccountSync from './AccountSync.jsx'
import PintNotifier from './PintNotifier.jsx'

// Background work that runs on every page.
export default function AppEffects() {
  return (
    <>
      <PintNotifier />
      <AccountSync />
    </>
  )
}
