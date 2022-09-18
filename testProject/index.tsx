import 'vite/types/importMeta.d'
import { createRoot } from 'react-dom/client'
import { Root } from './Root'

createRoot(document.getElementById('__root')!).render(<Root />)
