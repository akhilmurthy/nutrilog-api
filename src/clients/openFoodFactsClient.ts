export class OpenFoodFactsClient {
  private static readonly BASE_URL = 'https://world.openfoodfacts.org';

  static async getProductByBarcode(barcode: string): Promise<any> {
    try {
      console.log('Fetching product from Open Food Facts:', barcode);

      const response = await fetch(`${this.BASE_URL}/api/v0/product/${barcode}.json`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Open Food Facts response:', JSON.stringify(data, null, 2));

      return data;
    } catch (error) {
      console.error('Error fetching from Open Food Facts:', error);
      throw error;
    }
  }

  static async searchByText(query: string, limit: number = 10): Promise<any> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const params = new URLSearchParams({
        search_terms: query,
        search_simple: '1',
        action: 'process',
        json: '1',
        page_size: limit.toString(),
        fields: 'product_name,brands,nutriments,image_front_url,categories,code',
        lc: 'en',
        cc: 'us',
      });

      const response = await fetch(`${this.BASE_URL}/cgi/search.pl?${params}`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        return { products: [] };
      }

      return await response.json();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Open Food Facts search timed out');
      }
      return { products: [] };
    } finally {
      clearTimeout(timeout);
    }
  }
}