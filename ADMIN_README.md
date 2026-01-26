
# Admin (Products)

Pages:
- `/admin` → Enter PIN
- `/admin/products` → List & search
- `/admin/products/new` → Create with multiple image upload
- `/admin/products/[id]` → Edit product and images

### Setup
1. Supabase → **Storage**: Create a **public** bucket named `products`.
2. Supabase → **SQL**: Run `sql/add_product_images.sql` (creates `product_images` table and policies).
3. Vercel → **Environment Variables**:
   - `ADMIN_PIN` = choose a secret PIN (e.g., 9426)
   - `SUPABASE_SERVICE_ROLE_KEY` = Supabase → Settings → API → **Service key** (keep private)
4. **Deploy**. Open `/admin`, enter your PIN, and start adding products.

Uploads go through your server API using the service key (safer). Public can read images but cannot upload.
