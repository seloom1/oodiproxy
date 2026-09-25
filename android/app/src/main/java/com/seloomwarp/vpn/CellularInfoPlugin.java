package com.seloomwarp.vpn;

import android.Manifest;
import android.content.pm.PackageManager;
import android.telephony.CellInfo;
import android.telephony.CellSignalStrength;
import android.telephony.ServiceState;
import android.telephony.SubscriptionInfo;
import android.telephony.SubscriptionManager;
import android.telephony.TelephonyManager;

import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.util.List;

@CapacitorPlugin(
        name = "CellularInfo",
        permissions = {
                @Permission(
                        alias = "phone",
                        strings = { Manifest.permission.READ_PHONE_STATE, Manifest.permission.READ_PHONE_NUMBERS }
                )
        }
)
public final class CellularInfoPlugin extends Plugin {
    private static final String PHONE_PERMISSION = "phone";

    @com.getcapacitor.PluginMethod
    public void getInfo(PluginCall call) {
        if (getPermissionState(PHONE_PERMISSION) != PermissionState.GRANTED) {
            requestPermissionForAlias(PHONE_PERMISSION, call, "phonePermissionsCallback");
            return;
        }
        resolveInfo(call);
    }

    @PermissionCallback
    private void phonePermissionsCallback(PluginCall call) {
        resolveInfo(call);
    }

    private void resolveInfo(PluginCall call) {
        try {
            TelephonyManager telephony = (TelephonyManager) getContext().getSystemService(TelephonyManager.class);
            SubscriptionManager subscriptions = (SubscriptionManager) getContext().getSystemService(SubscriptionManager.class);
            JSObject result = new JSObject();
            result.put("available", telephony != null && telephony.getSimState() != TelephonyManager.SIM_STATE_ABSENT);
            result.put("carrierName", safe(telephony == null ? null : telephony.getNetworkOperatorName()));
            result.put("lineName", "");
            result.put("lineNumber", "");
            result.put("networkType", networkTypeName(telephony));
            result.put("simState", simStateName(telephony));
            result.put("signalDbm", null);
            result.put("signalLevel", null);

            if (subscriptions != null) {
                List<SubscriptionInfo> active = subscriptions.getActiveSubscriptionInfoList();
                if (active != null && !active.isEmpty()) {
                    SubscriptionInfo subscription = active.get(0);
                    CharSequence displayName = subscription.getDisplayName();
                    result.put("lineName", displayName == null ? "" : displayName.toString());
                    String number = subscription.getNumber();
                    result.put("lineNumber", safe(number));
                    if (result.getString("carrierName").isEmpty()) {
                        CharSequence carrier = subscription.getCarrierName();
                        result.put("carrierName", carrier == null ? "" : carrier.toString());
                    }
                }
            }

            if (telephony != null) {
                android.telephony.SignalStrength signal = telephony.getSignalStrength();
                if (signal != null) {
                    List<CellSignalStrength> strengths = signal.getCellSignalStrengths();
                    CellSignalStrength best = null;
                    for (CellSignalStrength strength : strengths) {
                        if (strength != null && strength.getDbm() != CellInfo.UNAVAILABLE) {
                            if (best == null || strength.getDbm() > best.getDbm()) best = strength;
                        }
                    }
                    if (best != null) {
                        result.put("signalDbm", best.getDbm());
                        result.put("signalLevel", best.getLevel());
                    }
                }
            }
            call.resolve(result);
        } catch (SecurityException denied) {
            call.resolve(unavailableInfo());
        } catch (Exception failure) {
            call.reject("تعذر قراءة معلومات الشريحة", failure);
        }
    }

    private JSObject unavailableInfo() {
        JSObject result = new JSObject();
        result.put("available", false);
        result.put("signalDbm", null);
        result.put("signalLevel", null);
        result.put("carrierName", "");
        result.put("lineName", "");
        result.put("lineNumber", "");
        result.put("networkType", "");
        result.put("simState", "");
        return result;
    }

    private String networkTypeName(TelephonyManager telephony) {
        if (telephony == null) return "";
        try {
            return android.telephony.TelephonyDisplayInfo.class.getSimpleName().isEmpty()
                    ? "" : networkTypeLabel(telephony.getDataNetworkType());
        } catch (SecurityException ignored) { return ""; }
    }

    private String networkTypeLabel(int type) {
        switch (type) {
            case TelephonyManager.NETWORK_TYPE_NR: return "5G";
            case TelephonyManager.NETWORK_TYPE_LTE: return "4G";
            case TelephonyManager.NETWORK_TYPE_HSPAP:
            case TelephonyManager.NETWORK_TYPE_HSPA:
            case TelephonyManager.NETWORK_TYPE_HSUPA:
            case TelephonyManager.NETWORK_TYPE_HSDPA: return "3G";
            case TelephonyManager.NETWORK_TYPE_EDGE:
            case TelephonyManager.NETWORK_TYPE_GPRS: return "2G";
            default: return "";
        }
    }

    private String simStateName(TelephonyManager telephony) {
        if (telephony == null) return "";
        switch (telephony.getSimState()) {
            case TelephonyManager.SIM_STATE_READY: return "جاهزة";
            case TelephonyManager.SIM_STATE_NETWORK_LOCKED: return "مقفلة على الشبكة";
            case TelephonyManager.SIM_STATE_PIN_REQUIRED: return "تحتاج PIN";
            case TelephonyManager.SIM_STATE_PUK_REQUIRED: return "تحتاج PUK";
            case TelephonyManager.SIM_STATE_ABSENT: return "غير موجودة";
            default: return "غير معروفة";
        }
    }

    private String safe(String value) { return value == null ? "" : value.trim(); }
}
