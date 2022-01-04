import { isKeyHotkey } from './isHotkey';

/**
 * Hotkey mappings for each platform.
 */
const IS_APPLE = typeof navigator !== 'undefined' && /Mac OS X/.test(navigator.userAgent);

const HOTKEYS = {
  undo: 'mod+z',
}

const APPLE_HOTKEYS = {
  redo: 'cmd+shift+z',
}

const WINDOWS_HOTKEYS = {
  redo: ['ctrl+y', 'ctrl+shift+z'],
}

/**
 * Create a platform-aware hotkey checker.
 */

const create = (key) => {
  const generic = HOTKEYS[key]
  const apple = APPLE_HOTKEYS[key]
  const windows = WINDOWS_HOTKEYS[key]
  const isGeneric = generic && isKeyHotkey(generic)
  const isApple = apple && isKeyHotkey(apple)
  const isWindows = windows && isKeyHotkey(windows)

  return (event) => {
    if (isGeneric && isGeneric(event)) return true
    if (IS_APPLE && isApple && isApple(event)) return true
    if (!IS_APPLE && isWindows && isWindows(event)) return true
    return false
  }
}

/**
 * Hotkeys.
 */

export default {
  isRedo: create('redo'),
  isUndo: create('undo'),
}
