-- Allow users to see their own roles (so they can check if they're admin)
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);