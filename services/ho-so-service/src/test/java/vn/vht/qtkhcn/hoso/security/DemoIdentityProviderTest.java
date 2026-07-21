package vn.vht.qtkhcn.hoso.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;
import org.junit.jupiter.api.Test;

class DemoIdentityProviderTest {

    private final DemoIdentityProvider provider = new DemoIdentityProvider();

    @Test
    void mapsTheAngularDemoAccountsToServerOwnedCandidateGroups() {
        assertEquals(Set.of("PM", "PA", "NNC"), provider.resolve(" PM@example.com ").roleCodes());
        assertEquals(Set.of("CQ_KHCN", "CQ_MS", "CQ_NS", "CQ_TCKT", "CQ_QLKHCN", "TP_CLKHCN"),
                provider.resolve("cqnv@example.com").roleCodes());
        assertEquals(Set.of("TGD_VHT", "BGD_TT", "BGD_KHOI", "PTGD_CT"),
                provider.resolve("tgd@example.com").roleCodes());
        assertEquals(Set.of("HDKHCN", "HDXD", "HDXD_DC", "HDNT", "HD_DGHT"),
                provider.resolve("hdkhcn@example.com").roleCodes());
        assertEquals(Set.of("GD_TTMS"), provider.resolve("gd-ttms@example.com").roleCodes());
        assertEquals(Set.of("TP_NS"), provider.resolve("tp-ns@example.com").roleCodes());
        assertEquals(Set.of("TP_TCKT"), provider.resolve("tp-tckt@example.com").roleCodes());
        assertFalse(provider.resolve("pm@example.com").administrator());
        assertTrue(provider.resolve("admin@example.com").administrator());
    }

    @Test
    void failsClosedForMissingAndUnknownIdentities() {
        assertThrows(IllegalArgumentException.class, () -> provider.resolve(" "));
        assertThrows(UnknownDemoIdentityException.class, () -> provider.resolve("unknown@example.com"));
    }
}
