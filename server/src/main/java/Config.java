public class Config
{
    public Config()
    { }

    public String getProperty(String key)
    {
        String value = System.getenv(key);
        return value;
    }
}