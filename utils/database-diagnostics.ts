import { supabase } from './supabase';

export const runDatabaseDiagnostics = async () => {
  console.log('🔍 Running database diagnostics...');
  
  const results = {
    connection: false,
    tables: {} as Record<string, boolean>,
    auth: false,
    profile: false,
    errors: [] as string[]
  };

  try {
    // Test 1: Basic connection
    console.log('Testing Supabase connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      results.errors.push(`Connection error: ${connectionError.message}`);
    } else {
      results.connection = true;
      console.log('✅ Supabase connection successful');
    }

    // Test 2: Check if all required tables exist
    const requiredTables = ['profiles', 'birds', 'couples', 'aviaries', 'nests', 'eggs', 'health_records'];
    
    for (const table of requiredTables) {
      try {
        console.log(`Checking table: ${table}`);
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          results.tables[table] = false;
          results.errors.push(`Table ${table}: ${error.message}`);
          console.log(`❌ Table ${table} not found or accessible`);
        } else {
          results.tables[table] = true;
          console.log(`✅ Table ${table} exists and accessible`);
        }
      } catch (err) {
        results.tables[table] = false;
        results.errors.push(`Table ${table}: ${err}`);
        console.log(`❌ Table ${table} error:`, err);
      }
    }

    // Test 3: Check authentication
    console.log('Testing authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      results.errors.push(`Auth error: ${authError.message}`);
      console.log('❌ Authentication error:', authError.message);
    } else if (user) {
      results.auth = true;
      console.log('✅ User is authenticated:', user.email);
      
      // Test 4: Check user profile
      console.log('Testing user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        results.errors.push(`Profile error: ${profileError.message}`);
        console.log('❌ Profile error:', profileError.message);
      } else if (profile) {
        results.profile = true;
        console.log('✅ User profile found:', profile.email);
      } else {
        results.errors.push('Profile not found');
        console.log('❌ Profile not found');
      }
    } else {
      console.log('ℹ️ No user currently authenticated');
    }

  } catch (error) {
    results.errors.push(`General error: ${error}`);
    console.error('❌ General diagnostic error:', error);
  }

  // Summary
  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  console.log('Connection:', results.connection ? '✅' : '❌');
  console.log('Authentication:', results.auth ? '✅' : '❌');
  console.log('Profile:', results.profile ? '✅' : '❌');
  console.log('\nTables:');
  Object.entries(results.tables).forEach(([table, exists]) => {
    console.log(`  ${table}: ${exists ? '✅' : '❌'}`);
  });
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS FOUND:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  } else {
    console.log('\n🎉 All diagnostics passed!');
  }

  return results;
};

export const testDatabaseOperations = async () => {
  console.log('🧪 Testing basic database operations...');
  
  try {
    // Test creating a test aviary
    const { data: aviary, error: aviaryError } = await supabase
      .from('aviaries')
      .insert({
        name: 'Test Aviary',
        description: 'Diagnostic test aviary',
        capacity: 2,
        location: 'Test Location'
      })
      .select()
      .single();

    if (aviaryError) {
      console.log('❌ Failed to create test aviary:', aviaryError.message);
      return false;
    }

    console.log('✅ Test aviary created:', aviary.name);

    // Test reading the aviary
    const { data: readAviary, error: readError } = await supabase
      .from('aviaries')
      .select('*')
      .eq('id', aviary.id)
      .single();

    if (readError) {
      console.log('❌ Failed to read test aviary:', readError.message);
      return false;
    }

    console.log('✅ Test aviary read successfully');

    // Clean up - delete the test aviary
    const { error: deleteError } = await supabase
      .from('aviaries')
      .delete()
      .eq('id', aviary.id);

    if (deleteError) {
      console.log('⚠️ Failed to clean up test aviary:', deleteError.message);
    } else {
      console.log('✅ Test aviary cleaned up');
    }

    console.log('🎉 All database operations working correctly!');
    return true;

  } catch (error) {
    console.error('❌ Database operations test failed:', error);
    return false;
  }
};