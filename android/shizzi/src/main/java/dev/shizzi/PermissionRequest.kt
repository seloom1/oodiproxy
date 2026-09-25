package dev.shizzi

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings as AndroidSettings

class PermissionRequest(private val context: Context) {

    fun settingsIntentFor(permission: AppPermission): Intent = when (permission) {
        AppPermission.NOTIFICATIONS -> appNotificationSettings()
        AppPermission.BATTERY_EXEMPTION -> batteryExemptionIntent()
    }

    fun open(permission: AppPermission) {
        try {
            context.startActivity(settingsIntentFor(permission).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        } catch (absent: ActivityNotFoundException) {
            if (permission == AppPermission.BATTERY_EXEMPTION) {
                openBatterySettingsFallback(absent)
            } else {
                SessionLog.warn("no screen for ${permission.name}: ${absent.message}")
            }
        } catch (security: SecurityException) {
            if (permission == AppPermission.BATTERY_EXEMPTION) {
                openBatterySettingsFallback(security)
            } else {
                SessionLog.warn("permission screen rejected for ${permission.name}: ${security.message}")
            }
        }
    }

    private fun batteryExemptionIntent() =
        Intent(AndroidSettings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
            .setData(Uri.fromParts("package", context.packageName, null))

    private fun openBatterySettingsFallback(cause: Exception) {
        try {
            context.startActivity(
                Intent(AndroidSettings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            )
            SessionLog.warn("direct battery exemption screen unavailable; opened battery settings: ${cause.message}")
        } catch (fallback: ActivityNotFoundException) {
            SessionLog.warn("no battery settings screen: ${fallback.message}")
        }
    }

    private fun appNotificationSettings() =
        Intent(AndroidSettings.ACTION_APP_NOTIFICATION_SETTINGS)
            .putExtra(AndroidSettings.EXTRA_APP_PACKAGE, context.packageName)
}
