'use strict';
const MoonInsights=(()=>{
 const stamp=s=>{const [y,m,d]=s.split('-').map(Number);return Date.UTC(y,m-1,d)/86400000;};
 const gap=(a,b)=>stamp(b)-stamp(a);
 const add=(s,n)=>new Date((stamp(s)+n)*86400000).toISOString().slice(0,10);
 function cycles(records,asOf){
  const entries=Object.entries(records).filter(([d])=>d<=asOf).sort(([a],[b])=>a.localeCompare(b));
  const starts=entries.filter(([,r])=>r.marker==='start').map(([d])=>d);
  const intervals=starts.slice(1).map((d,i)=>({from:starts[i],to:d,days:gap(starts[i],d)}));
  const recent=intervals.slice(-6),lengths=recent.map(r=>r.days);
  const average=lengths.length?Math.round(lengths.reduce((a,b)=>a+b,0)/lengths.length):null;
  const durations=[];
  for(let i=0;i<starts.length;i++){
   const end=entries.find(([d,r])=>d>=starts[i]&&(!starts[i+1]||d<starts[i+1])&&r.marker==='end');
   if(end)durations.push({start:starts[i],end:end[0],days:gap(starts[i],end[0])+1});
  }
  let prediction=null,reason='记录至少 4 次月经开始，才能估算下次范围。';
  if(lengths.length>=3){
   const min=Math.min(...lengths),max=Math.max(...lengths);
   if(min<15||max>90||max-min>14)reason='近期记录间隔差异较大或可能有漏记，暂不估算，请核对开始日期。';
   else {const start=add(starts.at(-1),min-2),end=add(starts.at(-1),max+2);if(end<asOf)reason='上次估算范围已过去，请补充实际开始日期；不会自动推到下一个月。';else{prediction={start,end};reason='按最近最多 6 个周期的最短／最长间隔，各留 2 天余量；不是医学置信区间。';}}
  }
  return {starts,intervals:recent,average,durations,day:starts.length?gap(starts.at(-1),asOf)+1:null,prediction,reason};
 }
 function activity(r){
  if(r?.pain==='severe')return{title:'今天先照顾不适',text:'先暂停高强度训练。疼痛严重、比平时明显加重或影响日常活动时，建议就医评估。'};
  if(!r||!r.energy||!r.pain||!r.sleep)return{title:'先听听今天的身体',text:'填写精力、疼痛和睡眠后，会显示运动参考。没有填写的项目不会按“状态良好”处理。'};
  if(r.energy==='low'||r.sleep==='poor'||r.pain==='moderate'||r.symptoms?.includes('疲惫'))return{title:'今天可以放轻一点',text:'可以休息，或按舒适程度散步、轻柔拉伸，减少训练量；不需要为了减脂或增肌硬撑。'};
  if(r.pain==='mild')return{title:'从轻活动开始',text:'可先尝试散步或轻柔活动，观察感受；若不适加重就停止，不必追赶训练进度。'};
  return{title:'可按感受安排原有训练',text:'你记录的恢复状态较好，可以从熟悉的训练和热身开始，过程中按感受调整。这个提示不是运动安全评估或效果保证。'};
 }
 return{gap,add,cycles,activity};
})();
if(typeof module!=='undefined')module.exports=MoonInsights;
