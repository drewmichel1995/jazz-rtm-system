import java.net.URL;
import java.util.Properties;

public class Config
{
    Properties configFile;
    public Config()
    {
        configFile = new java.util.Properties();
        try {
            URL url = getClass().getResource("config.cfg");
            configFile.load(url.openStream());
        }catch(Exception eta){
            eta.printStackTrace();
        }
    }

    public String getProperty(String key)
    {
        String value = this.configFile.getProperty(key);
        return value;
    }
}