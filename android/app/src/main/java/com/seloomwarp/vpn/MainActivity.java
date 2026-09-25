package com.seloomwarp.vpn;

import android.content.Intent;
import android.net.VpnService;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(VpnBridgePlugin.class);
        registerPlugin(ShizziBridgePlugin.class);
        registerPlugin(CellularInfoPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
