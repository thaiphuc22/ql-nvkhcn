package vn.vht.qtkhcn.hoso.security;
import static org.junit.jupiter.api.Assertions.*; import java.util.Set; import org.junit.jupiter.api.*; import org.springframework.http.*; import org.springframework.test.web.client.MockRestServiceServer; import org.springframework.web.client.RestClient;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*; import static org.springframework.test.web.client.response.MockRestResponseCreators.*;
class DemoIdentityProviderTest { private RestClient.Builder builder; private MockRestServiceServer server; private DemoIdentityProvider provider;
 @BeforeEach void setup(){builder=RestClient.builder();server=MockRestServiceServer.bindTo(builder).build();provider=new DemoIdentityProvider(builder,"http://identity","token");}
 @Test void mapsIdentityServiceResponse(){server.expect(requestTo("http://identity/internal/users/pm%40example.com/effective-permissions")).andExpect(header(HttpHeaders.AUTHORIZATION,"Bearer token")).andRespond(withSuccess("{\"userId\":\"pm@example.com\",\"roleCodes\":[\"PM\",\"PA\",\"NNC\"],\"administrator\":false}",org.springframework.http.MediaType.APPLICATION_JSON));assertEquals(Set.of("PM","PA","NNC"),provider.resolve(" PM@example.com ").roleCodes());server.verify();}
 @Test void failsClosed(){assertThrows(IllegalArgumentException.class,()->provider.resolve(" "));server.expect(anything()).andRespond(withStatus(HttpStatus.NOT_FOUND));assertThrows(UnknownDemoIdentityException.class,()->provider.resolve("unknown@example.com"));}
}
