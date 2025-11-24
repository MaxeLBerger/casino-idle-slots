import { ActionUiId, UiIconId } from '@/types';

export const UI_ICON_ASSETS: Record<UiIconId, string> = {
  map: '/assets/ui_items/ui_map.png',
  shop: '/assets/ui_items/ui_shop.png',
  stats: '/assets/ui_items/ui_stats.png',
  workers: '/assets/ui_items/ui_workers.png',
  prestige: '/assets/ui_items/ui_prestige.png',
  prestigeNav: '/assets/ui_items/ui_prestige_nav.png',
  settings: '/assets/ui_items/ui_settings.png',
  soundOn: '/assets/ui_items/ui_sound_on.png',
  soundOff: '/assets/ui_items/ui_sound_off.png',
  notification: '/assets/ui_items/ui_notification.png',
  inventory: '/assets/ui_items/ui_inventory.png',
  upgradeMenu: '/assets/ui_items/ui_upgrade_menu.png',
  info: '/assets/ui_items/ui_info.png',
  lockOverlay: '/assets/ui_items/ui_lock_overlay.png',
  event: '/assets/ui_items/ui_event.png',
  hostElegant: '/assets/ui_items/ui_host_elegant.png',
};

// Action UI Assets: diese Dateien kannst du in /public/assets/actions anlegen
// (Spin-Button, Auto-Spin-Toggle, Tooltip-Panel, Notification-Toast, Loading-Spinner)

export const ACTION_UI_ASSETS: Record<ActionUiId, string> = {
  spinButton: '/assets/actions/spin_button.png',
  autoSpinToggle: '/assets/actions/auto_spin_toggle.png',
  tooltipPanel: '/assets/actions/tooltip_panel.png',
  notificationToast: '/assets/actions/notification_toast.png',
  loadingSpinner: '/assets/actions/loading_spinner.png',
};
