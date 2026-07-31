package vn.vht.qtkhcn.identity.domain;
import java.io.Serializable; import java.util.UUID;
public record UserAppId(UUID user,String app) implements Serializable {}
