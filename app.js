// Full Updated Script

const groups = [];

document.getElementById('addGroupButton').addEventListener('click', () => {
  const groupName = prompt('Enter Group Name:');
  if (groupName) {
    const groupId = groups.length + 1;
    groups.push({ id: groupId, name: groupName, members: [] });
    renderGroups();
  }
});

function renderGroups() {
  const groupList = document.getElementById('groupList');
  groupList.innerHTML = '';
  groups.forEach(group => {
    const groupItem = document.createElement('div');
    groupItem.className = 'list-group-item';
    groupItem.innerHTML = `<strong>${group.name}</strong>
      <button class='btn btn-sm btn-secondary float-end' onclick='viewGroup(${group.id})'>View</button>`;
    groupList.appendChild(groupItem);
  });
}

function viewGroup(groupId) {
  const group = groups.find(g => g.id === groupId);
  const groupDetails = document.getElementById('groupDetails');

  const totalSpent = group.members.reduce((sum, member) => sum + member.expenses.reduce((s, v) => s + v, 0), 0);
  const equalShare = totalSpent / (group.members.length || 1);

  let memberHeaders = `<th>Items</th>` + group.members.map(member => `<th>${member.name}</th>`).join('') + '<th>Total</th>';
  let expenseRows = group.members[0]?.expenses.map((_, rowIndex) => {
    let itemCell = `<td>${group.items[rowIndex] || `Item ${rowIndex + 1}`}</td>`;
    let expenseCells = group.members
      .map((member, memberIndex) => `<td><input type='text' value='${member.expenses[rowIndex] || ''}' class='form-control' onchange='updateExpense(${groupId}, ${memberIndex}, ${rowIndex}, this.value)'></td>`)
      .join('');
    return `<tr>${itemCell}${expenseCells}<td></td></tr>`;
  }).join('') || '';

  const settlementStatement = calculateSettlement(group);

  groupDetails.innerHTML = `
    <h3>${group.name}</h3>
    <button class='btn btn-sm btn-success my-2' onclick='addMember(${groupId})'>Add Member</button>
    <button class='btn btn-sm btn-warning my-2' onclick='addExpense(${groupId})'>Add Expense</button>
    <table class='table table-bordered'>
      <thead>
        <tr>
          ${memberHeaders}
        </tr>
      </thead>
      <tbody>
        ${expenseRows}
        <tr>
          <td>Total</td>
          ${group.members.map(member => `<td>$${member.expenses.reduce((sum, val) => sum + val, 0).toFixed(2)}</td>`).join('')}
          <td>$${totalSpent.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Balance</td>
          ${group.members.map(member => {
            const memberSpent = member.expenses.reduce((sum, val) => sum + val, 0);
            const balance = memberSpent - equalShare;
            return `<td>${balance >= 0 ? '+' : ''}$${balance.toFixed(2)}</td>`;
          }).join('')}
          <td></td>
        </tr>
      </tbody>
    </table>
    <h4>Settlement Statement:</h4>
    <p>${settlementStatement}</p>
  `;
}

function addMember(groupId) {
  const memberName = prompt('Enter Member Name:');
  if (memberName) {
    const group = groups.find(g => g.id === groupId);
    group.members.push({ name: memberName, expenses: [] });
    viewGroup(groupId);
  }
}

function addExpense(groupId) {
  const itemName = prompt('Enter Item Name:');
  if (itemName) {
    const group = groups.find(g => g.id === groupId);
    group.items = group.items || [];
    group.items.push(itemName);
    group.members.forEach(member => member.expenses.push(0));
    viewGroup(groupId);
  }
}

function updateExpense(groupId, memberIndex, expenseIndex, value) {
  const group = groups.find(g => g.id === groupId);
  group.members[memberIndex].expenses[expenseIndex] = parseFloat(value) || 0;
  viewGroup(groupId);
}

function calculateSettlement(group) {
  const totalSpent = group.members.reduce((sum, member) => sum + member.expenses.reduce((s, v) => s + v, 0), 0);
  const equalShare = totalSpent / (group.members.length || 1);

  const balances = group.members.map(member => {
    const memberSpent = member.expenses.reduce((sum, val) => sum + val, 0);
    return { name: member.name, balance: memberSpent - equalShare };
  });

  balances.sort((a, b) => a.balance - b.balance);

  let settlement = '';
  let i = 0, j = balances.length - 1;

  while (i < j) {
    const giveAmount = Math.min(-balances[i].balance, balances[j].balance);
    settlement += `${balances[i].name} gives $${giveAmount.toFixed(2)} to ${balances[j].name}. `;
    balances[i].balance += giveAmount;
    balances[j].balance -= giveAmount;

    if (balances[i].balance === 0) i++;
    if (balances[j].balance === 0) j--;
  }

  return settlement || 'All balances are settled.';
}
