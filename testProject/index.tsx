import React from 'react'
import 'vite/types/importMeta.d'
import { createRoot } from 'react-dom/client'
import { Root } from './Root'

const root = createRoot(document.getElementById('__root')!)

root.render(<Root />)
