"""Cost guard regression checks; all external commands are mocked."""
import json,runpy,subprocess,unittest
from pathlib import Path
from unittest.mock import patch
SCRIPT=Path(__file__).resolve().parents[1]/'scripts/deploy_free.py'
class FreeDeployGuard(unittest.TestCase):
 def simulate(self,replies):
  def fake(args,**kwargs):
   reply=replies.pop(0) if replies else {}
   return subprocess.CompletedProcess(args,0,json.dumps(reply),'')
  with patch('subprocess.run',side_effect=fake) as command:
   try:runpy.run_path(str(SCRIPT),run_name='__main__')
   except SystemExit as e:return command.call_args_list,str(e)
   return command.call_args_list,None
 def test_billing_enabled_stops_before_firebase(self):
  calls,error=self.simulate([{'billingEnabled':True,'billingAccountName':'billingAccounts/test'}]);self.assertEqual(len(calls),1);self.assertIn('No changes',error)
 def test_unknown_billing_stops_before_firebase(self):
  calls,error=self.simulate([{}]);self.assertEqual(len(calls),1);self.assertIsNotNone(error)
 def test_other_database_refuses_second_database(self):
  calls,error=self.simulate([{'billingEnabled':False},{'result':[{'name':'projects/test/databases/other'}]}]);self.assertEqual(len(calls),2);self.assertIn('second database',error)
 def test_free_default_creation_uses_standard_no_paid_features(self):
  calls,error=self.simulate([{'billingEnabled':False},{'result':[]},{'result':{}},{},{}]);self.assertIsNone(error)
  args=[x.args[0] for x in calls];create=args[2];self.assertIn('standard',create);self.assertIn('DISABLED',create);self.assertNotIn('enterprise',create)
  deploy=args[-1];self.assertIn('auth,firestore:rules,hosting',deploy);self.assertFalse(any('functions'==x or 'billingAccounts' in x for x in deploy))
if __name__=='__main__':unittest.main()
