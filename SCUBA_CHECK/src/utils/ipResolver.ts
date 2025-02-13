export async function resolveIP(ip: string): Promise<any> {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json`);
    const data = await response.json();
    
    if (!data.error) {
      return {
        country: data.country_name,
        countryCode: data.country_code,
        region: data.region_code,
        regionName: data.region,
        city: data.city,
        zip: data.postal,
        lat: data.latitude,
        lon: data.longitude,
        timezone: data.timezone,
        isp: data.org,
        org: data.org,
        as: data.asn,
        asname: data.asn
      };
    }
    return null;
  } catch (error) {
    console.error('Error resolving IP:', error);
    return null;
  }
}