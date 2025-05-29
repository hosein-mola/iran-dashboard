/* eslint-disable @typescript-eslint/no-explicit-any */

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
]

export default eslintConfig

eslintConfig.forEach((config, index) => {
  if (index > 0 && eslintConfig[index - 1] === '') {
    eslintConfig.splice(index - 1, 1)
  }
})
