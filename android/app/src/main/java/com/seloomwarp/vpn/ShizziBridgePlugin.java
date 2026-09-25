package com.seloomwarp.vpn;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.PowerManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;

import rikka.shizuku.Shizuku;

@CapacitorPlugin(name = "ShizziBridge")
public final class ShizziBridgePlugin extends Plugin {
    @com.getcapacitor.PluginMethod
    public void status(PluginCall call) {
        JSObject result = new JSObject();
        boolean installed = false;
        try {
            getContext().getPackageManager().getPackageInfo("moe.shizuku.privileged.api", 0);
            installed = true;
        } catch (PackageManager.NameNotFoundException ignored) {
        }
        result.put("installed", installed);
        result.put("running", Shizuku.pingBinder());
        result.put("permissionGranted", Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED);
        result.put("uid", Shizuku.getUid());
        call.resolve(result);
    }

    @com.getcapacitor.PluginMethod
    public void open(PluginCall call) {
        Intent intent = new Intent(getActivity(), dev.shizzi.MainActivity.class);
        getActivity().startActivity(intent);
        call.resolve();
    }

    @com.getcapacitor.PluginMethod
    public void openShizuku(PluginCall call) {
        Intent launch = getContext().getPackageManager().getLaunchIntentForPackage("moe.shizuku.privileged.api");
        if (launch == null) {
            call.reject("Shizuku is not installed");
            return;
        }
        getActivity().startActivity(launch);
        call.resolve();
    }

    @com.getcapacitor.PluginMethod
    public void batteryStatus(PluginCall call) {
        PowerManager power = getContext().getSystemService(PowerManager.class);
        JSObject result = new JSObject();
        result.put("exempt", power != null && power.isIgnoringBatteryOptimizations(getContext().getPackageName()));
        call.resolve(result);
    }

    @com.getcapacitor.PluginMethod
    public void requestBatteryExemption(PluginCall call) {
        try {
            Intent direct = new Intent(android.provider.Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
                    .setData(android.net.Uri.parse("package:" + getContext().getPackageName()));
            getActivity().startActivity(direct);
            call.resolve();
        } catch (Exception directFailure) {
            try {
                Intent fallback = new Intent(android.provider.Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                getActivity().startActivity(fallback);
                call.resolve();
            } catch (Exception fallbackFailure) {
                call.reject("Battery settings could not be opened", fallbackFailure);
            }
        }
    }
}
