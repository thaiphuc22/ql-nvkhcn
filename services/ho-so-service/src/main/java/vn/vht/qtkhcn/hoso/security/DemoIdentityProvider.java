package vn.vht.qtkhcn.hoso.security;
import java.util.*; import org.springframework.beans.factory.annotation.Value; import org.springframework.http.*; import org.springframework.stereotype.Component; import org.springframework.web.client.*;
/** Resolves roles from identity-service while the request identity still comes from the demo header. */
@Component public class DemoIdentityProvider { private final RestClient identity;
 @org.springframework.beans.factory.annotation.Autowired public DemoIdentityProvider(@Value("${qtkhcn.identity.base-url:http://127.0.0.1:8095}")String baseUrl,@Value("${qtkhcn.identity.service-token:}")String token){this(RestClient.builder(),baseUrl,token);}
 DemoIdentityProvider(RestClient.Builder builder,String baseUrl,String token){identity=builder.baseUrl(baseUrl).defaultHeader(HttpHeaders.AUTHORIZATION,"Bearer "+token).build();}
 public DemoIdentity resolve(String header){String user=validate(header);try{Effective e=identity.get().uri("/internal/users/{id}/effective-permissions",user).retrieve().body(Effective.class);if(e==null)throw new UnknownDemoIdentityException("Identity is not active or allowed.");return new DemoIdentity(e.userId(),e.roleCodes()==null?Set.of():e.roleCodes(),e.administrator());}catch(HttpClientErrorException.NotFound e){throw new UnknownDemoIdentityException("Identity is not active or allowed.");}catch(RestClientException e){throw new IdentityServiceUnavailableException("Identity service is unavailable.",e);}}
 private static String validate(String v){if(v==null||v.isBlank())throw new IllegalArgumentException("X-QTKHCN-User-Id is required.");String x=v.trim().toLowerCase(Locale.ROOT);if(x.length()>128)throw new IllegalArgumentException("X-QTKHCN-User-Id must not exceed 128 characters.");return x;}
 private record Effective(String userId,Set<String> roleCodes,Set<String> permissions,boolean administrator){}
}
