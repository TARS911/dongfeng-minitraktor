import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(dotenv_path='frontend/.env.local')

url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

def get_table_columns(table_name):
    """Fetches column names and types for a given table."""
    try:
        # This is a bit of a hack as Supabase-py doesn't have a direct schema inspection method.
        # We fetch one row and get the columns from its keys.
        response = supabase.from_(table_name).select("*", head=True).execute()
        
        # The above does not return column types. We'll need to do a more direct query.
        # This uses the pg_catalog to get detailed column info.
        query = f"""
        SELECT 
            column_name, 
            data_type 
        FROM 
            information_schema.columns 
        WHERE 
            table_name = '{table_name}';
        """
        
        # Using rpc to run a raw SQL function
        # We need to create a function in Supabase SQL editor first:
        # CREATE OR REPLACE FUNCTION get_schema_info(p_table_name text)
        # RETURNS TABLE(column_name text, data_type text) AS $$
        # BEGIN
        #   RETURN QUERY SELECT isc.column_name::text, isc.data_type::text
        #   FROM information_schema.columns isc
        #   WHERE isc.table_name = p_table_name;
        # END;
        # $$ LANGUAGE plpgsql;
        
        # Since creating a function is not ideal, let's try another way.
        # We can fetch one row and inspect its keys. It won't give types, but it's a start.
        response = supabase.from_(table_name).select("*").limit(1).single().execute()

        if response.data:
            print(f"Columns for table '{table_name}':")
            for col_name in response.data.keys():
                print(f"- {col_name}")
        else:
            print(f"Could not fetch any data to inspect columns for table '{table_name}'.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    get_table_columns("products")
