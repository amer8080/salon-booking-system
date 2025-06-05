// src/lib/services-utils.ts
export function parseServices(services: string | null): string[] {
  if (!services || services.trim() === '') return [];
  
  try {
    // محاولة تحويل JSON أولاً
    const parsed = JSON.parse(services);
    
    // إذا كان مصفوفة، ارجعها كما هي
    if (Array.isArray(parsed)) {
      return parsed.filter(service => typeof service === 'string' && service.trim() !== '');
    }
    
    // إذا كان نص واحد، حوله لمصفوفة
    if (typeof parsed === 'string') {
      return [parsed];
    }
    
    return [];
  } catch (error) {
    // إذا فشل JSON parsing، تعامل كنص عادي
    if (typeof services === 'string') {
      const cleanService = services.trim();
      return cleanService ? [cleanService] : [];
    }
    
    return [];
  }
}

export function formatServicesForDatabase(services: string[]): string {
  if (!services || services.length === 0) return '[]';
  
  const cleanServices = services.filter(service => 
    typeof service === 'string' && service.trim() !== ''
  );
  
  return JSON.stringify(cleanServices);
}

export function isValidServicesJSON(services: string): boolean {
  try {
    const parsed = JSON.parse(services);
    return Array.isArray(parsed);
  } catch {
    return false;
  }
}
