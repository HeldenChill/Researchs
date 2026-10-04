const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const forest = read('docs/superpowers/plans/2026-10-01-forest-bloom-symbiotic-defense.md');
const blocks = [...forest.matchAll(/```csharp\s*\n([\s\S]*?)```/g)].map(m => m[1]);
const names = ['PsychologicalState', 'AffordanceVector', 'SoilProfile', 'SenseAppraisalOperator', 'ActuationOperator', 'WorldImpactOperator', 'DiscreteSimulationEngine', 'SimulationDashboard'];
const dir = path.join(root, '.correction-verification');
fs.mkdirSync(dir, {recursive:true});
for (const name of names) {
  const block = blocks.find(b => new RegExp(`(?:class|struct) ${name}\\b`).test(b));
  assert.ok(block, `Missing C# example ${name}`);
  fs.writeFileSync(path.join(dir, `${name}.cs`), block);
}
fs.writeFileSync(path.join(dir, 'Verify.csproj'), '<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net9.0</TargetFramework><EnableDefaultCompileItems>true</EnableDefaultCompileItems></PropertyGroup></Project>');
const phase=blocks.find(b=>b.includes('public enum ATTRACTOR_PHASE'));
assert.ok(phase,'Plant phase snippet exists');
const plantMembers=phase.replace(/public enum ATTRACTOR_PHASE[^\n]*\n/,'');
fs.writeFileSync(path.join(dir, 'Harness.cs'), `
using System;
using System.Collections.Generic;
namespace UnityEngine {
 public class MonoBehaviour {} public class SerializeField:Attribute {} public class Header:Attribute {public Header(string s){}} public class ContextMenu:Attribute {public ContextMenu(string s){}}
 public static class Time {public static float deltaTime=0.02f;}
 public static class Mathf { public static float Clamp(float x,float a,float b)=>Math.Min(b,Math.Max(a,x)); public static float Clamp01(float x)=>Clamp(x,0,1);public static float Max(float x,float y)=>Math.Max(x,y); public static float Min(float x,float y)=>Math.Min(x,y); }
}
namespace UnityEngine.UI {
 public class Button {public ClickEvent onClick=new ClickEvent();public class ClickEvent {public void AddListener(Action a){}public void RemoveListener(Action a){}}}
 public class Slider {public float minValue,maxValue,value;public ChangeEvent onValueChanged=new ChangeEvent();public class ChangeEvent {public void AddListener(Action<float> a){}public void RemoveListener(Action<float> a){}}}
}
namespace TMPro {public class TextMeshProUGUI {public string text;}}
namespace _Game {
 public enum PLANT_TYPE {GREEN,RED,BLUE,YELLOW,PURPLE,GRASS}
 public enum ATTRACTOR_PHASE {HOMEOSTATIC,STRESS,WILT}
 public class SGrid {}
 public class SCellData {public PlantUnit PlantUnit;public SoilProfile Soil=SoilProfile.DefaultWet();}
 public class SCell {public SCellData Data=new SCellData();public List<SCell> neighbors=new List<SCell>(); public List<SCell> GetCrossAroundCell()=>neighbors;}
 public class PlantUnit {public PLANT_TYPE Type;public PlantUnit(){PsychState=PsychologicalState.CreateDefaultFlora();}${plantMembers}}
 public static class Program {
 static int fails=0;static void Check(bool ok,string name){Console.WriteLine((ok?"PASS ":"FAIL ")+name);if(!ok)fails++;}
 static SCell Cell(PLANT_TYPE t,float v){var c=new SCell();c.Data.PlantUnit=new PlantUnit{Type=t};c.Data.PlantUnit.PsychState.V_bio=v;return c;}
 static DiscreteSimulationEngine NewEngine(){return new DiscreteSimulationEngine{RemovePlant=c=>c.Data.PlantUnit=null,SpawnPlant=(c,t)=>c.Data.PlantUnit=new PlantUnit{Type=t},RestoreInitialScene=()=>{}};}
 public static int Main(){
 var panic=PsychologicalState.CreateDefaultFlora();panic.V_bio=-1;var yellow=ActuationOperator.ComputeAffordances(panic,PLANT_TYPE.YELLOW);Check(yellow.BridgeStrength==0,"yellow panic gate");
 var red=panic;red.A_phys=1;red.D_dom=-1;Check(ActuationOperator.ComputeAffordances(red,PLANT_TYPE.RED).EmitHeat>=0,"nonnegative heat emission");
 var dying=Cell(PLANT_TYPE.GRASS,.2f);dying.Data.PlantUnit.PsychState=PsychologicalState.CreateDefaultBlight();var engine=new DiscreteSimulationEngine();engine.Initialize(new SGrid(),new List<SCell>{dying});engine.RemovePlant=c=>c.Data.PlantUnit=null;engine.SpawnPlant=(c,t)=>c.Data.PlantUnit=new PlantUnit{Type=t};engine.RestoreInitialScene=()=>{};for(int i=0;i<7;i++)engine.ExecuteStep();Check(dying.Data.PlantUnit.Affordance.EmitTox==0,"wilt stops toxin emission");for(int i=0;i<5;i++)engine.ExecuteStep();Check(dying.Data.PlantUnit==null,"prolonged wilt removes plant");
 var a=Cell(PLANT_TYPE.YELLOW,0);var b=Cell(PLANT_TYPE.YELLOW,1);a.Data.Soil.Moisture=b.Data.Soil.Moisture=.4f;a.neighbors.Add(b);b.neighbors.Add(a);engine=new DiscreteSimulationEngine();engine.Initialize(new SGrid(),new List<SCell>{a,b});engine.ExecuteStep();float av=a.Data.PlantUnit.PsychState.V_bio,bv=b.Data.PlantUnit.PsychState.V_bio;
 var x=Cell(PLANT_TYPE.YELLOW,0);var y=Cell(PLANT_TYPE.YELLOW,1);x.Data.Soil.Moisture=y.Data.Soil.Moisture=.4f;x.neighbors.Add(y);y.neighbors.Add(x);engine=new DiscreteSimulationEngine();engine.Initialize(new SGrid(),new List<SCell>{y,x});engine.ExecuteStep();Check(Math.Abs(av-x.Data.PlantUnit.PsychState.V_bio)<1e-6&&Math.Abs(bv-y.Data.PlantUnit.PsychState.V_bio)<1e-6,"coupling order invariance");Check(Math.Abs(av+bv-1)<1e-6,"coupling preserves pair sum");
 var wet=new SCell();var dry=new SCell();wet.Data.Soil.Moisture=.9f;dry.Data.Soil.Moisture=.1f;wet.neighbors.Add(dry);dry.neighbors.Add(wet);engine=new DiscreteSimulationEngine();engine.Initialize(new SGrid(),new List<SCell>{wet,dry});engine.ExecuteStep();Check(dry.Data.Soil.Moisture>.09f,"soil diffuses into dry neighbor");Check(Math.Abs(wet.Data.Soil.Moisture+dry.Data.Soil.Moisture-.98f)<1e-5,"diffusion conserves post-evaporation water");
 var source=Cell(PLANT_TYPE.GREEN,.8f);source.Data.PlantUnit.PsychState.Ex_seek=1;source.Data.PlantUnit.PsychState.C_cog=1;var target=new SCell();source.neighbors.Add(target);target.neighbors.Add(source);engine=new DiscreteSimulationEngine();engine.Initialize(new SGrid(),new List<SCell>{source,target});int birthCount=0;engine.SpawnPlant=(c,t)=>{birthCount++;c.Data.PlantUnit=new PlantUnit{Type=t};};engine.RemovePlant=c=>c.Data.PlantUnit=null;engine.RestoreInitialScene=()=>{source.Data.PlantUnit=new PlantUnit{Type=PLANT_TYPE.GREEN};target.Data.PlantUnit=null;source.Data.Soil=target.Data.Soil=SoilProfile.DefaultWet();};for(int i=0;i<7;i++){source.Data.Soil.Moisture=target.Data.Soil.Moisture=.8f;engine.ExecuteStep();}Check(birthCount==1&&target.Data.PlantUnit!=null,"growth creates plant through adapter");int notifications=0;engine.StepCompleted+=()=>notifications++;engine.ResetSimulation();Check(engine.CurrentStep==0&&!engine.IsAutoRunning&&target.Data.PlantUnit==null&&notifications==1,"reset restores scene and notifies observers");
 var recover=PsychologicalState.CreateDefaultFlora();recover.C_cog=.15f;var soil=SoilProfile.DefaultWet();for(int i=0;i<4;i++)SenseAppraisalOperator.ApplyAppraisal(ref recover,soil);Check(recover.C_cog>=.2f,"safe wet soil can rescue wilt before death");
 return fails==0?0:1; }
 }
}
`.replaceAll('engine=new DiscreteSimulationEngine()','engine=NewEngine()'));
const result=cp.spawnSync('dotnet',['run','--project',path.join(dir,'Verify.csproj'),'--verbosity','quiet'],{encoding:'utf8',env:{...process.env,DOTNET_CLI_HOME:dir,DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1',DOTNET_CLI_TELEMETRY_OPTOUT:'1'}});
process.stdout.write(result.stdout||'');process.stderr.write(result.stderr||'');
if(result.status!==0)process.exit(result.status||1);
const python=read('docs/superpowers/plans/2026-09-27-psychological-trauma-simulation.md');
const ws=python.slice(python.indexOf('@app.websocket'),python.indexOf('# Mount static files'));
assert.ok(!ws.includes('engine.step()'),'WebSocket must not advance simulation');
assert.ok(python.includes('async def simulation_loop()'),'Application-owned clock');
assert.ok(python.includes('"INSUFFICIENT_DATA"')&&python.includes('"STATIONARY"'),'Explicit PR unavailable statuses');
assert.ok(!python.includes('eigenvalues = np.maximum(eigenvalues, 1e-9)'),'No fake dimensions for constant history');
console.log('PASS Python clock and PR static contracts (not runtime execution)');
const guidanceFiles = ['AGENTS.md', 'CLAUDE.md', 'memory/conversation-summary.md',
 'docs/superpowers/specs/2026-10-04-project-correction-register.md'];
function walk(relative) {
 for (const entry of fs.readdirSync(path.join(root, relative), {withFileTypes:true})) {
  const file=path.join(relative,entry.name);
  if(entry.isDirectory())walk(file);
  else if(entry.name.endsWith('.md')&&read(file).includes('Current correction guidance'))guidanceFiles.push(file);
 }
}
walk('MeetingMinutes');walk('agents');
for(const name of fs.readdirSync(root))if(name.endsWith('.md')&&read(name).includes('Current correction guidance'))guidanceFiles.push(name);
let links=0;
for(const file of guidanceFiles) {
 for(const match of read(file).matchAll(/\]\(([^\s)]*2026-10-04-project-correction[^\s)]*|(?:\.\.\/)+[^\s)]+|2026-10-04-project-corrections-design\.md)\)/g)) {
  const target=match[1].split('#')[0];
  assert.ok(fs.existsSync(path.resolve(root,path.dirname(file),target)),`Broken correction link: ${file} -> ${target}`);
  links++;
 }
}
assert.ok(links>20,'Expected propagated correction guidance links');
console.log(`PASS ${links} local correction/reference links`);
