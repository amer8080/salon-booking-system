export function parseServices(servicesData: any): string[] {
  if (!servicesData) return ['13'];
  
  if (typeof servicesData === 'string') {
    try {
      const parsed = JSON.parse(servicesData);
      if (Array.isArray(parsed)) return parsed.map(String);
      return [String(parsed)];
    } catch {
      return ['13'];
    }
  }
  
  if (Array.isArray(servicesData)) {
    return servicesData.map(String);
  }
  
  return ['13'];
}

export function getServiceNames(serviceIds: string[], services: any): string[] {
  return serviceIds.map(id => {
    const service = services[id];
    return service?.name || `خدمة ${id}`;
  });
}
