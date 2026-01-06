-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public) VALUES ('service-images', 'service-images', true);

-- Create storage bucket for profile avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for service-images bucket
CREATE POLICY "Anyone can view service images"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');

CREATE POLICY "Authenticated users can upload service images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-images');

CREATE POLICY "Users can update their own service images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'service-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own service images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'service-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars bucket
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);